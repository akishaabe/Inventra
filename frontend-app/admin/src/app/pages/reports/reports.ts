import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit {
  sidebarOpen = false;
  activeTab = 'sales';
  reportData: any[] = [];
  inventoryData: any[] = [];
  forecastData: any[] = [];
  aiRecommendations: any[] = [];
  selectedHorizon = 14;
  forecastChart: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchReportData();
    this.fetchForecastData();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    document.body.classList.toggle('sidebar-active', this.sidebarOpen);
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
    const res = await fetch('http://localhost:4000/api/admin/reports/sales');
    const data = await res.json();
    this.reportData = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching sales report:', err);
    this.reportData = [];
  }
}

async fetchInventoryData() {
  try {
    const res = await fetch('http://localhost:4000/api/admin/reports/inventory');
    const data = await res.json();
    this.inventoryData = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching inventory report:', err);
    this.inventoryData = [];
  }
}
async fetchForecastData() {
  try {
    const res = await fetch(
      `http://localhost:4000/api/forecasts?refresh=true&period=${this.selectedHorizon}`
    );

    if (!res.ok) {
      console.error('Forecasts API error:', res.status, await res.text());
      this.forecastData = [];
      this.aiRecommendations = [];
      return;
    }

    const data = await res.json();

    // Ensure we have an array
    this.forecastData = Array.isArray(data) ? data : [];

    // Build chart dataset — for chart we will plot the top N products (or aggregated)
    // Here: take the first product's horizon if backend returns per-date data
    // But based on your current backend response (one row per product) we will plot product demand.
    // Map forecasted_demand to number
    this.forecastData = this.forecastData.map((r: any) => ({
      ...r,
      forecasted_demand: Number(r.forecasted_demand),
      quantity_available: r.quantity_available !== undefined ? Number(r.quantity_available) : null,
      ai_recommendations: r.ai_recommendations || []
    }));

    // Try generating the chart only if there is at least one item and canvas exists
    setTimeout(() => {
      this.generateChart();
    }, 0);

    this.generateRecommendations();
  } catch (err) {
    console.error('Error fetching forecast data:', err);
    this.forecastData = [];
    this.aiRecommendations = [];
  }
}

generateChart() {
  const canvas = document.getElementById('forecastChart') as HTMLCanvasElement | null;
  if (!canvas) {
    console.warn('Chart canvas not found yet.');
    return;
  }
  if (!this.forecastData || !this.forecastData.length) {
    // clear existing chart if any
    if (this.forecastChart) {
      this.forecastChart.destroy();
      this.forecastChart = null;
    }
    return;
  }

  // Simple chart: product vs forecasted_demand
  const labels = this.forecastData.map(f => f.product_name || `P${f.product_id}`);
  const values = this.forecastData.map(f => f.forecasted_demand || 0);

  if (this.forecastChart) this.forecastChart.destroy();

  try {
    this.forecastChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Forecasted Demand',
          data: values,
          borderColor: '#3c2321',
          backgroundColor: undefined,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { title: { display: true, text: 'Product' } }, y: { title: { display: true, text: 'Predicted Quantity' } } }
      }
    });
  } catch (err) {
    console.error('Failed to create chart:', err);
  }
}

generateRecommendations() {
  // Collect recommendations across products (dedupe/limit)
  const recs: { text: string; reason?: string; priority?: string }[] = [];

  if (!this.forecastData || !this.forecastData.length) {
    this.aiRecommendations = [];
    return;
  }

  for (const row of this.forecastData) {
    // backend returns ai_recommendations array of objects
    if (row.ai_recommendations && Array.isArray(row.ai_recommendations)) {
      for (const r of row.ai_recommendations) {
        // ensure r has text/priority
        const text = r.text || r.recommendation_text || JSON.stringify(r);
        const reason = r.reason || r.detail || null;
        const priority = r.priority || 'normal';
        recs.push({ text, reason, priority });
      }
    }
  }

  // dedupe by text and limit to top 10
  const seen = new Set<string>();
  const deduped = [];
  for (const r of recs) {
    if (!seen.has(r.text)) {
      seen.add(r.text);
      deduped.push(r);
      if (deduped.length >= 10) break;
    }
  }

  // filter out null or empty recommendations before showing
this.aiRecommendations = deduped.filter(r => 
  r.text && r.reason && r.priority
);

}


  printReport() {
    window.print();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
