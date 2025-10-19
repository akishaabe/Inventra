import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings {
  sidebarOpen = false;
  selectedTab = 'users';

  showAddUser = false;
  showRemoveUser = false;
  showChangePassword = false;

  newUser = { email: '', tempPass: '', firstName: '', lastName: '' };
  selectedUser: any = null;
  passwords = { current: '', new: '', confirm: '' };

  superAdmins = [{ name: 'Cali Mendiola', role: 'Super Admin' }];
  admins = [
    { name: 'Juan Dela Cruz', role: 'Admin' },
    { name: 'Jan Dela Cruz', role: 'Admin' }
  ];
  staffList = [
    { name: 'Jose Cruz', role: 'Staff' },
    { name: 'Lui Perez', role: 'Cashier' },
    { name: 'Jun Garcia', role: 'Staff' }
  ];

  auditLogs = [
    { date: '2025-09-25 10:32', user: 'Jun Garcia', role: 'Staff', action: 'Updated Inventory', details: 'Edited product “Milk Tea” stock from 25 → 40' },
    { date: '2025-09-25 10:32', user: 'Maria Santos', role: 'Admin', action: 'Added User', details: 'Created account for “Ana Lopez” (Staff)' }
  ];

  deletedItems = [
    { date: '2025-09-25 10:32', type: 'Account', name: 'Kiel Luz', role: 'Staff', deletedBy: 'Juan Dela Cruz' }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  logout() {
    console.log('Logout');
  }

  openAddUser() {
    this.showAddUser = true;
  }

  closeAddUser() {
    this.showAddUser = false;
    this.newUser = { email: '', tempPass: '', firstName: '', lastName: '' };
  }

  saveUser() {
    this.staffList.push({
      name: `${this.newUser.firstName} ${this.newUser.lastName}`,
      role: 'Staff'
    });
    this.closeAddUser();
  }

  openRemoveUser(user: any) {
    this.selectedUser = user;
    this.showRemoveUser = true;
  }

  closeRemoveUser() {
    this.showRemoveUser = false;
  }

  confirmRemoveUser() {
    this.admins = this.admins.filter(a => a !== this.selectedUser);
    this.staffList = this.staffList.filter(a => a !== this.selectedUser);
    this.closeRemoveUser();
  }

  openChangePassword() {
    this.showChangePassword = true;
  }

  savePassword() {
    console.log('Password changed!');
    this.showChangePassword = false;
  }
}
