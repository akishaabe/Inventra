import { Component, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forecasting',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavbarComponent, SidebarComponent],
  templateUrl: './forecasting.html',
  styleUrls: ['./forecasting.css']
})
export class Forecasting implements OnInit, AfterViewInit {
  @ViewChild('forecastChart') chartRef!: ElementRef<HTMLCanvasElement>;

  sidebarOpen = false;
  forecastData: any[] = [];
  recommendations: any[] = [];
  chart: any;

  // table / rec limits & toggles
  tableLimit = 5;
  recLimit = 2;
  tableExpanded = false;
  recExpanded = false;

  // forecasting period dropdown
  forecastPeriods = [7, 14, 30, 60, 90];
  selectedPeriod = 14; // default

  dataLoaded = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // initial load
    this.loadForecast(this.selectedPeriod);
  }

  ngAfterViewInit() {
    // if data was already loaded before view init, build chart
    setTimeout(() => {
      if (this.dataLoaded) this.buildChart();
    }, 120);
  }

  /**
   * Load forecast from backend (period = number of days)
   */
  loadForecast(period: number) {
    this.http
      .get<any[]>(`${environment.apiBase}/forecasts?refresh=true&period=${period}`)
      .subscribe({
        next: (data) => {
          console.log('Raw API data:', data);
          console.log(`API forecasts (${period} days):`, data[0]);
          console.log(environment.apiBase); 



          this.forecastData = data.map((item: any) => {
            const demand = parseFloat(item.forecasted_demand) || 0;
            const currentQty = parseFloat(item.quantity_available) || 0;
            return {
              product: item.product_name,
              weeks: [this.formatWeek(item.forecast_date)],
              prediction: [`${demand.toFixed(2)}kg`],
              current: `${currentQty.toFixed(2)}kg`,
              action: this.getAction(demand, currentQty)
            };
          });

          console.log('Loaded forecastData:', this.forecastData);

          // update recommendations, chart, and limits
          this.recommendations = this.generateRecommendations(this.forecastData);
          this.dataLoaded = true;

          // if table expanded, keep full length; otherwise ensure 10
          this.tableLimit = this.tableExpanded ? this.forecastData.length : 10;
          this.recLimit = this.recExpanded ? this.recommendations.length : 4;

          // rebuild chart after small delay (ensures canvas mounted)
          setTimeout(() => this.buildChart(), 80);
        },
        error: (err) => {
          console.error('Failed to load forecasts', err);
        }
      });
  }

  formatWeek(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getAction(predicted: number, current: number): string {
    const diff = predicted - current;
    if (diff > 0) return `Order ${diff.toFixed(2)}kg`;
    if (diff < -10) return `Reduce ${Math.abs(diff).toFixed(2)}kg`;
    return 'No action';
  }

  generateRecommendations(data: any[]): any[] {
    return data.map(item => {
      const predicted = parseFloat(item.prediction[0]) || 0;
      const current = parseFloat(item.current) || 0;
      const diff = predicted - current;

      if (diff > 20) {
        return {
          title: 'High Priority',
          count: 1,
          description: `Order ${diff.toFixed(2)}kg of ${item.product}`,
          subtext: `Current: ${current.toFixed(2)}kg → Predicted: ${predicted.toFixed(2)}kg`,
          actionText: 'Create Purchase Order',
          priority: 'high-priority'
        };
      } else if (diff < -15) {
        return {
          title: 'Reduce Inventory',
          count: 1,
          description: `${item.product}`,
          subtext: `Overstocked by ${Math.abs(diff).toFixed(2)}kg`,
          actionText: 'Adjust Order',
          priority: 'reduce'
        };
      } else {
        return {
          title: 'Opportunities',
          count: 1,
          description: `Promo opportunity: ${item.product}`,
          subtext: 'Stable demand',
          actionText: 'Create Promotion',
          priority: 'opportunity'
        };
      }
    });
  }

  buildChart() {
    const ctx = this.chartRef?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.warn('Chart context not ready yet.');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.forecastData.map(d => d.weeks[0]);
    const predicted = this.forecastData.map(d => parseFloat(d.prediction[0]) || 0);
    const current = this.forecastData.map(d => parseFloat(d.current) || 0);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Predicted Demand',
            data: predicted,
            borderColor: '#8b1e1e',
            borderWidth: 2,
            fill: false,
            tension: 0.3
          },
          {
            label: 'Current Stock',
            data: current,
            borderColor: '#3a5f3a',
            borderWidth: 2,
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  openRecommendation(rec: any) {
    alert(`Clicked: ${rec.title}`);
  }

  toggleTable() {
    this.tableExpanded = !this.tableExpanded;
    this.tableLimit = this.tableExpanded ? this.forecastData.length : 10;
  }

  toggleRecs() {
    this.recExpanded = !this.recExpanded;
    this.recLimit = this.recExpanded ? this.recommendations.length : 4;
  }

  updateForecastPeriod() {
    // called from template select -> simply load new period
    this.loadForecast(this.selectedPeriod);
  }
}
