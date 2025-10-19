import { Component, HostListener, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { environment } from '../../../environments/environment';

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
  actionText?: string;
  keyClass: 'high' | 'medium' | 'low' | 'opportunity' | string;
}

@Component({
  selector: 'app-forecasting',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './forecasting.html',
  styleUrls: ['./forecasting.css']
})
export class Forecasting implements OnInit, AfterViewInit {
  @ViewChild('forecastChart') chartRef!: ElementRef<HTMLCanvasElement>;

  // Dashboard-like state
  sidebarOpen = false;
  showLogoutModal = false;

  // Forecasting data/state
  forecastData: ForecastItem[] = [];
  recommendations: RecommendationCard[] = [];
  chart: any;

  // grouping
  groupedRecs: { [k: string]: RecommendationCard[] } = { high: [], medium: [], low: [], opportunity: [] };
  groupOrder = ['high', 'medium', 'low', 'opportunity'];
  groupStates: { [k: string]: boolean } = { high: false, medium: false, low: false, opportunity: false };

  // forecasting period
  forecastPeriods = [7, 14, 30, 60, 90];
  selectedPeriod = 14;

  dataLoaded = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadForecast(this.selectedPeriod);
  }

  ngAfterViewInit() {
    setTimeout(() => { if (this.dataLoaded) this.buildChart(); }, 120);
  }

  /* ---------------- Dashboard/Sidebar logic (copied) ---------------- */
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) document.body.classList.add('sidebar-active');
    else document.body.classList.remove('sidebar-active');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (this.sidebarOpen && sidebar && !sidebar.contains(event.target as Node) && toggleBtn && !toggleBtn.contains(event.target as Node)) {
      this.sidebarOpen = false;
      document.body.classList.remove('sidebar-active');
    }
  }

  openLogoutModal() { this.showLogoutModal = true; }
  closeLogoutModal() { this.showLogoutModal = false; }
  confirmLogout() {
    localStorage.clear();
    this.showLogoutModal = false;
    this.router.navigate(['/home']);
  }

  goToSettings() { this.router.navigate(['/settings']); }
  goToInventory() { this.router.navigate(['/inventory']); }

  /* ---------------- Forecasting data + UI ---------------- */
  loadForecast(period: number) {
    this.http.get<any[]>(`${environment.apiBase}/forecasts?refresh=true&period=${period}`).subscribe({
      next: (data) => {
        // Process table items
        this.forecastData = (data || []).map((item: any) => {
          const demand = parseFloat(item.forecasted_demand) || 0;
          const currentQty = parseFloat(item.quantity_available) || 0;
          return {
            product: item.product_name,
            weeks: [this.formatWeek(item.forecast_date)],
            prediction: [`${demand.toFixed(2)}kg`],
            current: `${currentQty.toFixed(2)}kg`,
            action: this.getAction(demand, currentQty),
            ai_recommendations: Array.isArray(item.ai_recommendations) ? item.ai_recommendations : []
          } as ForecastItem;
        });

        // Flatten AI recs (supports either ai_recommendations array or fallback fields)
        let flatRecs: RecommendationCard[] = this.forecastData
          .flatMap(fd => (fd.ai_recommendations || []).map((r: AiRecommendation) => {
            const key = this.getKeyFromPriority(r.priority);
            return {
              title: this.prettyTitleFromKey(key),
              description: r.text || '',
              subtext: r.reason || '',
              actionText: '',
              keyClass: key
            } as RecommendationCard;
          }));

        if (!flatRecs.length) {
          // fallback mapping (some APIs send ai_recommendation / ai_priority)
          flatRecs = (data || [])
            .map((it: any) => {
              if (!it.ai_recommendation) return null;
              const key = this.getKeyFromPriority(it.ai_priority || '');
              return {
                title: this.prettyTitleFromKey(key),
                description: it.ai_recommendation,
                subtext: it.ai_reason || '',
                actionText: '',
                keyClass: key
              } as RecommendationCard;
            })
            .filter(Boolean) as RecommendationCard[];
        }

        // remove empty descriptions & dedupe
        flatRecs = flatRecs.filter(r => r.description && r.description.trim() !== '');
        const unique = Array.from(new Map(flatRecs.map(r => [r.keyClass + '|' + r.description, r])).values());
        this.recommendations = unique;

        // group them (reset groups first)
        this.resetGroups();
        this.recommendations.forEach(r => {
          const k = (r.keyClass || 'low') as string;
          if (!this.groupedRecs[k]) this.groupedRecs[k] = [];
          if (!this.groupedRecs[k].some(x => x.description === r.description)) this.groupedRecs[k].push(r);
        });

        this.dataLoaded = true;
        setTimeout(() => this.buildChart(), 80);
      },
      error: (err) => {
        console.error('Failed to load forecasts', err);
      }
    });
  }

  resetGroups() { this.groupedRecs = { high: [], medium: [], low: [], opportunity: [] }; }

  hasAnyRecommendations() { return this.groupOrder.some(g => (this.groupedRecs[g] && this.groupedRecs[g].length > 0)); }

  getKeyFromPriority(priority: string): 'high' | 'medium' | 'low' | 'opportunity' {
    if (!priority) return 'low';
    const p = priority.toLowerCase();
    if (p.includes('high')) return 'high';
    if (p.includes('medium')) return 'medium';
    if (p.includes('low')) return 'low';
    if (p.includes('opportunity')) return 'opportunity';
    if (p.includes('reduce')) return 'low';
    return 'low';
  }

  prettyTitleFromKey(k: string) {
    switch (k) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      case 'opportunity': return 'Opportunities';
      default: return 'Recommendation';
    }
  }

  prettyGroupTitle(k: string) { return this.prettyTitleFromKey(k); }

  formatWeek(dateStr: string) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getAction(predicted: number, current: number) {
    const diff = predicted - current;
    if (diff > 0) return `Order ${diff.toFixed(2)}kg`;
    if (diff < -10) return `Reduce ${Math.abs(diff).toFixed(2)}kg`;
    return 'No action';
  }

  buildChart() {
    const ctx = this.chartRef?.nativeElement?.getContext('2d');
    if (!ctx) { console.warn('Chart context not ready yet.'); return; }
    if (this.chart) this.chart.destroy();

    const labels = this.forecastData.map(d => d.weeks.join(', '));
    const predicted = this.forecastData.map(d => parseFloat((d.prediction && d.prediction[0]) || '0') || 0);
    const current = this.forecastData.map(d => parseFloat((d.current || '0').toString().replace('kg','')) || 0);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Predicted Demand', data: predicted, borderColor: '#8b1e1e', borderWidth: 2, fill: false, tension: 0.3, pointRadius: 6, pointHoverRadius: 8 },
          { label: 'Current Stock', data: current, borderColor: '#3a5f3a', borderWidth: 2, fill: false, tension: 0.3, pointRadius: 6, pointHoverRadius: 8 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context: any) => {
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

  /* Accordion behavior: only one group open at a time */
  toggleGroup(key: string) {
    const currentlyOpen = this.groupStates[key];
    // close all
    Object.keys(this.groupStates).forEach(k => this.groupStates[k] = false);
    // open the clicked one if it was closed
    this.groupStates[key] = !currentlyOpen;
  }

  openRecommendation(rec: RecommendationCard) {
    // placeholder for modal or navigation - currently alert for quick feedback
    alert(`Recommendation: ${rec.description}`);
  }

  getActionText(priorityKey: string) {
    switch ((priorityKey || '').toString()) {
      case 'high': return 'Order ASAP';
      case 'medium': return 'Review Stock';
      case 'low': return 'Reduce Inventory';
      case 'opportunity': return 'Create Promo';
      default: return 'Take Action';
    }
  }

  trackByRec(index: number, item: RecommendationCard) { return item.description || index; }

  updateForecastPeriod() { this.loadForecast(this.selectedPeriod); }
}
