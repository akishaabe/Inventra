import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  sidebarOpen = false;
  selectedTab = 'users';
  currentUser: any = { first_name: '', last_name: '', email: '', role: '' };

  showAddUser = false;
  showRemoveUser = false;
  showChangePassword = false;
  showUserAdded = false;

  newUser = { email: '', tempPass: '', firstName: '', lastName: '' };
  selectedUser: any = null;

toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
  if (this.sidebarOpen) {
    document.body.classList.add('sidebar-active');
  } else {
    document.body.classList.remove('sidebar-active');
  }
}


  // Passwords
  passwords = { current: '', new: '', confirm: '' };
  error = '';
  sending = false;

  // Password strength & validation
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSymbol = false;
  isLengthValid = false;
  strength = 0;
  strengthLabel = '';
  strengthColor = '';
  passwordsMatch = true;

  superAdmins: any[] = [];
  admins: any[] = [];
  staffList: any[] = [];
  auditLogs: any[] = [];
  deletedItems: any[] = [];

  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadUsers();
    this.loadAuditLogs();
    this.loadDeletedItems();
  }

  // ───────────────────── CURRENT USER ─────────────────────
  loadCurrentUser() {
    try {
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      const email = user?.email;
      if (!email) return;
      this.http.get<any>(`${this.apiUrl}/users/by-email`, { params: { email } }).subscribe({
        next: (u) => (this.currentUser = u),
        error: (err) => console.error('Failed to load current user:', err)
      });
    } catch (e) {
      console.error('Failed to parse current user from storage', e);
    }
  }

  // ───────────────────── USER DATA ─────────────────────
  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe({
      next: (data) => {
        this.superAdmins = data.filter(u => u.role === 'SUPERADMIN');
        this.admins = data.filter(u => u.role === 'ADMIN');
        this.staffList = data.filter(u => u.role === 'STAFF');
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  saveUser() {
    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.email || !this.newUser.tempPass) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      first_name: this.newUser.firstName,
      last_name: this.newUser.lastName,
      email: this.newUser.email,
      password_hash: this.newUser.tempPass,
      role: 'STAFF'
    };

    this.http.post(`${this.apiUrl}/users`, payload).subscribe({
      next: () => {
        this.closeAddUser();
        this.showUserAdded = true;
        this.loadUsers();
        this.loadAuditLogs();
      },
      error: (err) => {
        console.error('Error saving user:', err);
        alert('Failed to save user. Please try again.');
      }
    });
  }

  // ───────────────────── REMOVE USER ─────────────────────
  openRemoveUser(user: any) {
    this.selectedUser = user;
    this.showRemoveUser = true;
  }

  confirmRemoveUser() {
    this.http.delete(`${this.apiUrl}/users/${this.selectedUser.user_id}`).subscribe({
      next: () => {
        this.showRemoveUser = false;
        this.loadUsers();
        this.loadDeletedItems();
        this.loadAuditLogs();
      },
      error: (err) => {
        console.error('Error removing user:', err);
        alert('Failed to remove user.');
      }
    });
  }

  closeRemoveUser() {
    this.showRemoveUser = false;
  }

  // ───────────────────── PASSWORD VALIDATION LOGIC ─────────────────────
  onPasswordInput() {
    const pw = this.passwords.new;

    this.hasUppercase = /[A-Z]/.test(pw);
    this.hasLowercase = /[a-z]/.test(pw);
    this.hasNumber = /\d/.test(pw);
    this.hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    this.isLengthValid = pw.length >= 8;

    let score = 0;
    if (this.hasUppercase) score++;
    if (this.hasLowercase) score++;
    if (this.hasNumber) score++;
    if (this.hasSymbol) score++;
    if (this.isLengthValid) score++;

    this.strength = score;

    if (score <= 2) {
      this.strengthLabel = 'Weak';
      this.strengthColor = 'red';
    } else if (score === 3 || score === 4) {
      this.strengthLabel = 'Medium';
      this.strengthColor = 'orange';
    } else if (score === 5) {
      this.strengthLabel = 'Strong';
      this.strengthColor = 'green';
    }

    this.checkPasswordMatch();
  }

  onConfirmPasswordInput() {
    this.checkPasswordMatch();
  }

  checkPasswordMatch() {
    this.passwordsMatch =
      this.passwords.new === this.passwords.confirm || !this.passwords.confirm;
  }

  // ───────────────────── CHANGE PASSWORD ─────────────────────
  openChangePassword() {
    this.showChangePassword = true;
  }

  savePassword() {
    this.error = '';

    if (!this.passwords.current || !this.passwords.new || !this.passwords.confirm) {
      this.error = 'Please fill in all fields.';
      alert(this.error);
      return;
    }

    const strongPassword =
      this.hasUppercase &&
      this.hasLowercase &&
      this.hasNumber &&
      this.hasSymbol &&
      this.isLengthValid;

    if (!strongPassword) {
      this.error = 'Please make sure your password meets all the requirements.';
      alert(this.error);
      return;
    }

    if (!this.passwordsMatch) {
      this.error = 'Passwords do not match.';
      alert(this.error);
      return;
    }

    // Resolve email reliably
    let email = this.currentUser?.email;
    if (!email) {
      try {
        const raw = localStorage.getItem('user');
        const u = raw ? JSON.parse(raw) : null;
        email = u?.email;
      } catch {}
    }
    if (!email) {
      alert('Could not resolve your email. Please re-login and try again.');
      return;
    }

    const payload = {
      email,
      currentPassword: this.passwords.current,
      newPassword: this.passwords.new
    };

    this.sending = true;
    this.http.put(`${this.apiUrl}/change-password`, payload).subscribe({
      next: () => {
        this.sending = false;
        alert('Password changed successfully.');
        this.showChangePassword = false;
        this.passwords = { current: '', new: '', confirm: '' };
      },
      error: (err) => {
        this.sending = false;
        console.error('Failed to change password:', err);
        alert('Error changing password.');
      }
    });
  }

  // ───────────────────── AUDIT LOGS / DELETED ITEMS ─────────────────────
  loadAuditLogs() {
    this.http.get<any[]>(`${this.apiUrl}/audit-logs`).subscribe({
      next: (data) => (this.auditLogs = data),
      error: (err) => console.error('Failed to load audit logs:', err)
    });
  }

  loadDeletedItems() {
    this.http.get<any[]>(`${this.apiUrl}/deleted-items`).subscribe({
      next: (data) => (this.deletedItems = data),
      error: (err) => console.error('Failed to load deleted items:', err)
    });
  }

  // ───────────────────── UI / MISC ─────────────────────
  closeUserAdded() {
    this.showUserAdded = false;
  }

  openAddUser() {
    this.showAddUser = true;
  }

  closeAddUser() {
    this.showAddUser = false;
    this.newUser = { email: '', tempPass: '', firstName: '', lastName: '' };
  }

@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.menu-btn'); // match your HTML

  if (
    this.sidebarOpen &&
    sidebar &&
    !sidebar.contains(event.target as Node) &&
    toggleBtn &&
    !toggleBtn.contains(event.target as Node)
  ) {
    this.sidebarOpen = false;
    document.body.classList.remove('sidebar-active');
  }
}

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    console.log('Logout clicked');
  }

  showLogoutModal = false;

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
}
