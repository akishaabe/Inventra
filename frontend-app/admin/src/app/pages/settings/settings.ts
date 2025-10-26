import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { SettingsService } from './settings.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  sidebarOpen = false;
  showLogoutModal = false;


constructor(private settingsService: SettingsService, private router: Router) {}

  // === Profile fields ===
  adminId: number | null = null; // store logged-in admin id when we load profile
  firstName = '';
  lastName = '';
  email = '';
  role = '';
  is2FA = 0;

  // === User list ===
  users: any[] = [];

  // === Modals and temp models ===
  showAddUser = false;
  showRemoveModal = false;
  showConfirmModal = false;
  confirmMessage = '';
  removeCandidate: any = null;

  newUser = { email: '', password: '', firstName: '', lastName: '' };
  passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/;

  ngOnInit() {
    this.loadUsers();
    this.loadAdminProfile();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // === Load All Users ===
loadUsers() {
  this.settingsService.getAllUsers().subscribe({
    next: (res) => {
      if (res.success && Array.isArray(res.data)) {
        this.users = res.data
          // 🔹 Filter out SUPERADMIN users
          .filter((u: any) => u.role !== 'SUPERADMIN' && u.role !== 'ADMIN')
          .map((u: any) => ({
            id: u.user_id, // backend sends user_id, not id
            name: `${u.first_name} ${u.last_name}`,
            role: u.role,
            email: u.email
          }));
      }
    },
    error: (err) => console.error('Error loading users:', err)
  });
}


  // === Load Admin Profile ===
  loadAdminProfile() {
    const adminId = 6; // temp: replace later with actual logged-in id
    this.settingsService.getAdminProfile(adminId).subscribe({
      next: (res) => {
        const payload = res && res.data ? res.data : res;
        if (payload) {
          this.adminId = payload.user_id ?? adminId;
          this.firstName = payload.first_name ?? '';
          this.lastName = payload.last_name ?? '';
          this.email = payload.email ?? '';
          this.role = payload.role ?? '';
          this.is2FA = payload.is_2fa_enabled ?? 0;
        }
      },
      error: (err) => {
        console.error('Error loading admin profile:', err);
      }
    });
  }

  // === Add User ===
  openAddUserModal(event?: Event) {
    if (event) event.preventDefault();
    this.resetNewUser();
    this.showAddUser = true;
  }

  closeAddUserModal() {
    this.showAddUser = false;
  }

  submitNewUser(form: any) {
    if (!form || form.invalid) {
      Object.values(form.controls).forEach((ctrl: any) => ctrl.markAsTouched());
      return;
    }

    const newUserData = {
      first_name: this.newUser.firstName,
      last_name: this.newUser.lastName,
      email: this.newUser.email,
      password_hash: this.newUser.password,
      role: 'STAFF'
    };

    this.settingsService.addUser(newUserData).subscribe({
      next: (res) => {
        this.confirmMessage = res.message || 'User added!';
        this.showConfirmModal = true;
        this.showAddUser = false;
        this.loadUsers();
        this.resetNewUser();
      },
      error: (err) => {
        console.error('Error adding user:', err);
        this.confirmMessage = 'Error adding user!';
        this.showConfirmModal = true;
      }
    });
  }

  resetNewUser() {
    this.newUser = { email: '', password: '', firstName: '', lastName: '' };
  }

  // === Save Admin Changes ===
  saveChanges() {
    const idToUse = this.adminId ?? 1;
    const updateData: any = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      role: this.role || undefined,
      is_2fa_enabled: this.is2FA
    };

    // call the admin-specific endpoint (updateAdminProfile)
    this.settingsService.updateAdminProfile(idToUse, updateData).subscribe({
      next: (res) => {
        this.confirmMessage = res.message || 'Changes saved!';
        this.showConfirmModal = true;
        // reload users & profile so UI reflects changes
        this.loadAdminProfile();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating admin:', err);
        this.confirmMessage = 'Error saving changes!';
        this.showConfirmModal = true;
      }
    });
  }

  // === Remove User ===
  promptRemoveUser(user: any) {
    this.removeCandidate = user;
    this.showRemoveModal = true;
  }

  confirmRemove() {
    if (!this.removeCandidate) return;

    this.settingsService.deleteUser(this.removeCandidate.id).subscribe({
      next: (res) => {
        this.confirmMessage = res.message || 'User removed!';
        this.showConfirmModal = true;
        this.showRemoveModal = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error removing user:', err);
        this.confirmMessage = 'Error removing user!';
        this.showConfirmModal = true;
      }
    });
  }

  cancelRemove() {
    this.removeCandidate = null;
    this.showRemoveModal = false;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  // === From Dashboard Nav Bar and Side Bar ===
  openLogoutModal() {
  this.showLogoutModal = true;
}

closeLogoutModal() {
  this.showLogoutModal = false;
}

confirmLogout() {
  localStorage.clear();
  document.cookie = 'inventra_user=; Max-Age=0; Path=/; SameSite=Lax';
  this.showLogoutModal = false;
  window.location.href = `${environment.sharedBase}/`;
}

goToSettings() {
  this.router.navigate(['/settings']);
}

}
