import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings {
  sidebarOpen = false;

  // profile fields
  firstName = 'Juan';
  lastName = 'Dela Cruz';
  email = 'jdelacruz123@gmail.com';

  // users list (demo seed)
  users = [
    { name: 'Jose Cruz', role: 'Staff', email: 'jose@example.com' },
    { name: 'Lui Perez', role: 'Cashier', email: 'lui@example.com' },
    { name: 'Jun Garcia', role: 'Staff', email: 'jun@example.com' }
  ];

  // Add-user modal state + model
  showAddUser = false;
  newUser = { email: '', password: '', firstName: '', lastName: '' };

  // Confirmation / result modals
  showConfirmModal = false;
  confirmMessage = '';

  // Remove user confirmation
  showRemoveModal = false;
  removeCandidate: any = null;

  // Password regex
  passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/;

  // Sidebar toggle (triggered by navbar)
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // === Add User modal handling ===
  openAddUserModal(event?: Event) {
    if (event) event.preventDefault();
    this.resetNewUser();
    this.showAddUser = true;
  }

  closeAddUserModal() {
    this.showAddUser = false;
  }

submitNewUser(form: any) {
  // If invalid, mark all controls as touched and stop
  if (!form || form.invalid) {
    Object.values(form.controls).forEach((ctrl: any) => ctrl.markAsTouched());
    return;
  }

  // Simple extra check to ensure email looks valid
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(this.newUser.email)) {
    form.controls['email'].setErrors({ invalid: true });
    return;
  }

  // Add new user to list
  this.users.push({
    name: `${this.newUser.firstName} ${this.newUser.lastName}`,
    role: 'Staff',
    email: this.newUser.email
  });

  // Show confirmation modal
  this.showAddUser = false;
  this.confirmMessage = 'User added!';
  this.showConfirmModal = true;

  this.resetNewUser();
}


  resetNewUser() {
    this.newUser = { email: '', password: '', firstName: '', lastName: '' };
  }

  // === Edit Profile ===
  saveChanges() {
    // pretend saving
    this.confirmMessage = 'Changes Saved!';
    this.showConfirmModal = true;
  }

  // === Remove User flow ===
  promptRemoveUser(user: any) {
    this.removeCandidate = user;
    this.showRemoveModal = true;
  }

  confirmRemove() {
    if (this.removeCandidate) {
      this.users = this.users.filter(u => u !== this.removeCandidate);
      this.removeCandidate = null;
      this.showRemoveModal = false;
      this.confirmMessage = 'User removed!';
      this.showConfirmModal = true;
    }
  }

  cancelRemove() {
    this.removeCandidate = null;
    this.showRemoveModal = false;
  }

  // Close confirmation modal
  closeConfirmModal() {
    this.showConfirmModal = false;
  }
}
