import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  sidebarOpen = false;

  constructor(private settingsService: SettingsService, private router: Router) {}

  // === Profile ===
  adminId: number | null = null;
  firstName = '';
  lastName = '';
  email = '';
  role = '';
  is2FA = 0;
  loadingProfile = false;

  // === Users ===
  users: any[] = [];
  loadingUsers = false;

  // === Modals ===
  showAddUser = false;
  showRemoveModal = false;
  showConfirmModal = false;
  showLogoutModal = false; // ✅ added missing logout modal flag
  confirmMessage = '';
  removeCandidate: any = null;

  // === Form Models ===
  newUser = { email: '', password: '', firstName: '', lastName: '' };
  passwordPattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/;

  ngOnInit() {
    this.loadAdminProfile();
    this.loadUsers();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // === Load Admin Profile ===
  loadAdminProfile() {
    const adminId = 6; // temp placeholder for logged-in admin
    this.loadingProfile = true;

    this.settingsService.getAdminProfile(adminId).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        if (payload) {
          this.adminId = payload.user_id ?? adminId;
          this.firstName = payload.first_name ?? '';
          this.lastName = payload.last_name ?? '';
          this.email = payload.email ?? '';
          this.role = payload.role ?? '';
          this.is2FA = payload.is_2fa_enabled ?? 0;
        }
      },
      error: (err) => console.error('Error loading admin profile:', err),
      complete: () => (this.loadingProfile = false)
    });
  }

  // === Load Users ===
  loadUsers() {
    this.loadingUsers = true;

    this.settingsService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.users = res.data
            .filter((u: any) => u.role !== 'SUPERADMIN')
            .map((u: any) => ({
              id: u.user_id,
              name: `${u.first_name} ${u.last_name}`,
              role: u.role,
              email: u.email
            }));
        }
      },
      error: (err) => console.error('Error loading users:', err),
      complete: () => (this.loadingUsers = false)
    });
  }

  // === Save Admin Changes ===
  saveChanges() {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) {
      this.confirmMessage = 'Please fill in all required fields.';
      this.showConfirmModal = true;
      return;
    }

    const updateData = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      role: this.role || undefined,
      is_2fa_enabled: this.is2FA
    };

    const idToUse = this.adminId ?? 1;

    this.settingsService.updateAdminProfile(idToUse, updateData).subscribe({
      next: (res) => {
        this.confirmMessage = res.message || 'Profile updated successfully!';
        this.showConfirmModal = true;
        this.loadAdminProfile();
      },
      error: (err) => {
        console.error('Error saving admin profile:', err);
        this.confirmMessage = 'Error saving changes!';
        this.showConfirmModal = true;
      }
    });
  }

  // === Add User Modal ===
  openAddUserModal(event?: Event) {
    event?.preventDefault();
    this.resetNewUser();
    this.showAddUser = true;
  }

  closeAddUserModal() {
    this.showAddUser = false;
  }

  submitNewUser(form: any) {
    if (!form?.valid) {
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
        this.confirmMessage = res.message || 'User added successfully!';
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

  // === Remove User Modal ===
  promptRemoveUser(user: any) {
    this.removeCandidate = user;
    this.showRemoveModal = true;
  }

  confirmRemove() {
    if (!this.removeCandidate) return;

    this.settingsService.deleteUser(this.removeCandidate.id).subscribe({
      next: (res) => {
        this.confirmMessage = res.message || 'User removed successfully!';
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

  // === 🟤 LOGOUT MODAL HANDLING (added for missing HTML bindings) ===
  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    // ✅ Add your logout logic here (e.g., clearing sessionStorage)
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
    this.showLogoutModal = false;
  }

  // === 🟤 SETTINGS PAGE NAVIGATION HANDLER ===
  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
