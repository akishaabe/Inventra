import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  sidebarOpen = false;
  dashboardData = {
    todaySales: 0,
    lowStock: 0,
    stockValue: 0,
    forecastDemand: 0
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    document.body.classList.toggle('sidebar-active', this.sidebarOpen);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.menu-btn'); // ✅ fixed selector

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

  async fetchDashboardData() {
    try {
      const res = await fetch('http://localhost:4000/api/dashboard');
      const data = await res.json();
      this.dashboardData = data;
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToInventory() {
    this.router.navigate(['/inventory']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
