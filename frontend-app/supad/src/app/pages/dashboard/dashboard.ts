import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  // ✅ sidebar toggle state
  sidebarOpen = false;

  // ✅ sample metrics
  stats = [
    { title: 'Total Products', value: 1284, delta: '+6.4%' },
    { title: 'Low Stock', value: 23, delta: '-1' },
    { title: 'Pending Orders', value: 42, delta: '+3' },
    { title: 'Stock Value', value: '₱1,248,560', delta: '+2.1%' }
  ];

  // ✅ sample chart points for sparkline
  chartPoints = [12, 18, 9, 21, 28, 24, 32, 30, 34, 36, 40, 45];

  // ✅ low-stock table sample
  lowStock = [
    { sku: 'P-0012', name: 'Rose Bouquet (12 stems)', stock: 3, reorder: 20 },
    { sku: 'P-0048', name: 'Vase - Ceramic', stock: 2, reorder: 10 },
    { sku: 'P-0121', name: 'Ribbon - Red', stock: 5, reorder: 50 }
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.removeItem('twofaEmail');
    localStorage.removeItem('twofaCode');
    this.router.navigate(['/login']);
  }

  // ✅ sparkline generator
  getSparklinePath(): string {
    const width = 300;
    const height = 90;
    const max = Math.max(...this.chartPoints);
    const min = Math.min(...this.chartPoints);
    const len = this.chartPoints.length;
    const step = width / (len - 1);
    const points = this.chartPoints.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    });
    return points.join(' ');
  }
}
