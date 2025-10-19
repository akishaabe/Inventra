import { Component, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

// interfaces
interface AiRecommendation {
  priority: string;
  text: string;
  reason?: string;
}

interface ForecastItem {
  product: string;
  weeks: string[];
  prediction: string[];
  current: string;
  action: string;
  ai_recommendations?: AiRecommendation[];
}

interface RecommendationCard {
  title: string;
  description: string;
  subtext: string;
  actionText: string;
  priority: string;
}

@Component({
  selector: 'app-forecasting',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './forecasting.html',
  styleUrls: ['./forecasting.css']
})
export class Forecasting implements OnInit, AfterViewInit {
  @ViewChild('forecastChart') chartRef!: ElementRef<HTMLCanvasElement>;

  sidebarOpen = false;
  forecastData: any[] = [];
  recommendations: any[] = [];
  groupedRecommendations: any[] = [];
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
    this.loadForecast(this.selectedPeriod);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.dataLoaded) this.buildChart();
    }, 120);
  }

  loadForecast(period: number) {
    this.http
      .get<any[]>(`${environment.apiBase}/forecasts?refresh=true&period=${period}`)
      .subscribe({
        next: (data) => {
          console.log('Raw API data:', data);

          // Process forecast data for table
          this.forecastData = data.map((item: any) => {
            const demand = parseFloat(item.forecasted_demand) || 0;
            const currentQty = parseFloat(item.quantity_available) || 0;

            return {
              product: item.product_name,
              weeks: [this.formatWeek(item.forecast_date)],
              prediction: [`${demand.toFixed(2)}kg`],
              current: `${currentQty.toFixed(2)}kg`,
              action: this.getAction(demand, currentQty),
              ai_recommendations: Array.isArray(item.ai_recommendations)
                ? item.ai_recommendations
                : []
            };
          });

          // Flatten all AI recommendations
          const flatRecs = this.forecastData
            .flatMap(item =>
              (item.ai_recommendations || []).map((r: AiRecommendation) => ({
                title: r.priority || 'Recommendation',
                description: r.text,
                subtext: r.reason || '',
                actionText: '',
                priority: this.mapPriorityClass(r.priority)
              }))
            )
            .filter(r => r.description && r.description.trim() !== '');

          // Remove duplicates
          this.recommendations = Array.from(
            new Map(flatRecs.map(r => [r.title + '|' + r.description, r])).values()
          );

          this.groupRecommendations();

          this.tableLimit = this.tableExpanded ? this.forecastData.length : 10;
          this.recLimit = this.recExpanded ? this.recommendations.length : 3;

          this.dataLoaded = true;
          setTimeout(() => this.buildChart(), 80);
        },
        error: (err) => console.error('Failed to load forecasts', err)
      });
  }

  // 🟢 Group by priority for accordion
  groupRecommendations() {
    const groups = ['high-priority', 'medium-priority', 'low-priority', 'opportunity'];
    this.groupedRecommendations = groups
      .map(priority => ({
        priority,
        expanded: false,
        items: this.recommendations.filter(r => r.priority === priority)
      }))
      .filter(g => g.items.length > 0);
  }

  toggleGroup(priority: string) {
    const group = this.groupedRecommendations.find(g => g.priority === priority);
    if (group) group.expanded = !group.expanded;
  }

  openRecommendation(rec: any): void {
  // You can adjust this to whatever behavior you want
  console.log('Selected recommendation:', rec);
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

  getPriorityColor(priority: string): string {
    switch ((priority || '').toLowerCase()) {
      case 'high-priority':
        return 'red';
      case 'medium-priority':
        return 'orange';
      case 'low-priority':
        return 'yellow';
      case 'opportunity':
        return 'green';
      default:
        return 'black';
    }
  }

  mapPriorityClass(priority: string) {
    switch ((priority || '').toLowerCase()) {
      case 'high':
      case 'high-priority':
        return 'high-priority';
      case 'medium':
      case 'medium-priority':
        return 'medium-priority';
      case 'low':
      case 'low-priority':
        return 'low-priority';
      case 'opportunity':
        return 'opportunity';
      default:
        return '';
    }
  }

  buildChart() {
    const ctx = this.chartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    const labels = this.forecastData.map(d => d.weeks.join(', '));
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
            tension: 0.3,
            pointStyle: 'circle',
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Current Stock',
            data: current,
            borderColor: '#3a5f3a',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointStyle: 'rectRot',
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label;
                const value = context.raw;
                const product = this.forecastData[context.dataIndex]?.product;
                return `${datasetLabel} (${product}): ${value}kg`;
              }
            }
          }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  toggleTable() {
    this.tableExpanded = !this.tableExpanded;
    this.tableLimit = this.tableExpanded ? this.forecastData.length : 10;
  }

  toggleRecs() {
    this.recExpanded = !this.recExpanded;
    this.recLimit = this.recExpanded ? this.recommendations.length : 3;
  }

  updateForecastPeriod() {
    this.loadForecast(this.selectedPeriod);
  }
}
