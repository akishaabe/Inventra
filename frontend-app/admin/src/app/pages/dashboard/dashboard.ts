import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  providers: [DecimalPipe]
})
export class DashboardComponent implements OnInit {
  sidebarOpen = false;

  currentStockValue = 50000;
  forecastDemand = 3500;

  dashboardData = [
    { name: 'Current Stock Value', value: this.currentStockValue },
    { name: 'Forecast Demand', value: this.forecastDemand },
    { name: 'Revenue Growth', value: 12.5 }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnInit(): void {}
}
