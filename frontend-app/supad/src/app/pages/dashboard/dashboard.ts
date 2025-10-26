import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule  } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  sidebarOpen = false;
  today = new Date();
  dashboardData = {
    todaySales: 0,
    lowStock: 0,
    stockValue: 0,
    forecastDemand: 0
  };
  aiRec: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchDashboardData();
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
    const toggleBtn = document.querySelector('.menu-toggle');

  
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
      const res = await fetch(`${environment.apiBase}/dashboard?horizon=7`);
      const data = await res.json();
      this.dashboardData = data;
      // Fetch AI recommendation
  const airec = await fetch(`${environment.apiBase}/forecasts/ai-recommendation`);
  this.aiRec = await airec.json();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
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

  goToSettings() {
  this.router.navigate(['/settings']);
}

goToInventory() {
  this.router.navigate(['/inventory']);
}

goToForecasting() {
  this.router.navigate(['/forecasting']);
}

}
