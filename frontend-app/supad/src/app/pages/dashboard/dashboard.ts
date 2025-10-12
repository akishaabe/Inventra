import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
}
