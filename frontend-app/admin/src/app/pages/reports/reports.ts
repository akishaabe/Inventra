import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit {
  sidebarOpen = false;
  activeTab = 'sales';
  reportData: any[] = [];
  inventoryData: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchReportData();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      document.body.classList.add('sidebar-active');
    } else {
      document.body.classList.remove('sidebar-active');
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.menu-btn');

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

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'sales') this.fetchReportData();
    if (tab === 'inventory') this.fetchInventoryData();
  }

  async fetchReportData() {
    try {
      const res = await fetch('http://localhost:4000/api/reports/sales');
      const data = await res.json();
      this.reportData = data;
    } catch (err) {
      console.error('Error fetching sales report:', err);
    }
  }

  async fetchInventoryData() {
    try {
      const res = await fetch('http://localhost:4000/api/reports/inventory');
      const data = await res.json();
      this.inventoryData = data;
    } catch (err) {
      console.error('Error fetching inventory report:', err);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
