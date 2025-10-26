import { Component, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule  } from '@angular/router';
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
  sidebarOpen = false;

  forecastData: ForecastItem[] = [];
  recommendations: RecommendationCard[] = [];
  chart: any;
  chartData: any[] = [];


  // grouping
  groupedRecs: { [k: string]: RecommendationCard[] } = {
    high: [],
    medium: [],
    low: [],
    opportunity: []
  };
  // track expanded/collapsed state per group (accordion)
  groupStates: { [k: string]: boolean } = { high: false, medium: false, low: false, opportunity: false };
  groupOrder = ['high', 'medium', 'low', 'opportunity'];

  // forecasting period dropdown
  forecastPeriods = [7, 14, 30, 60, 90];
  selectedPeriod = 14; // default

  dataLoaded = false;
  today = new Date();
  categories: string[] = ['All'];
  selectedCategory = 'All';


  // dashboard sidebar
  constructor(private http: HttpClient, private router: Router) {}


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
        // Build categories from data
        const apiCats = Array.from(new Set((data || []).map((d: any) => (d.category || '').toString())));
        const canonical = ['Flavoring','Ingredient','Packaging','Raw Material','Supply'];
        const merged = new Set<string>(['All', ...canonical]);
        for (const c of apiCats) {
          if (!c) continue;
          // Title-case fallback
          const t = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
          merged.add(t);
        }
        this.categories = Array.from(merged);

        // Apply category filter (default All)
        const filteredData = (this.selectedCategory === 'All')
          ? data
          : (data || []).filter(d => (d.category || '').toLowerCase() === this.selectedCategory.toLowerCase());

        // Process forecast data for table (non-beverage only)
        this.forecastData = filteredData.map((item: any) => {
          const demand = parseFloat(item.forecasted_demand) || 0;
          const currentQty = parseFloat(item.quantity_available) || 0;

          return {
            product: item.product_name,
            weeks: [this.formatWeek(item.forecast_date)],
            prediction: [`${demand.toFixed(2)}kg`],
            current: `${currentQty.toFixed(2)}kg`,
            action: this.getAction(demand, currentQty),
            ai_recommendations: Array.isArray(item.ai_recommendations) ? item.ai_recommendations : []
          };
        });

        // Flatten AI recs from forecastData (unchanged)
        const flatRecs: RecommendationCard[] = this.forecastData
          .flatMap(fd => (fd.ai_recommendations || []).map((r: AiRecommendation) => {
            const key = this.getKeyFromPriority(r.priority);
            return {
              title: this.prettyTitleFromKey(key),
              description: r.text || '',
              subtext: r.reason || '',
              actionText: '',
              keyClass: key
            } as RecommendationCard;
          }))
          .filter(r => r.description && r.description.trim() !== '');

        // Fallback for alternate API fields (unchanged)
        if (flatRecs.length === 0 && data && data.length > 0) {
          const alt = data
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
          this.recommendations = alt;
        } else {
          this.recommendations = flatRecs;
        }

        // Group AI recs (unchanged)
        this.resetGroups();
        this.recommendations.forEach(r => {
          const k = (r.keyClass || 'low') as string;
          if (!this.groupedRecs[k]) this.groupedRecs[k] = [];
          if (!this.groupedRecs[k].some(x => x.description === r.description)) {
            this.groupedRecs[k].push(r);
          }
        });

        // Use the filtered dataset for chart, too
        this.chartData = filteredData;


        this.dataLoaded = true;
        if (this.chart instanceof Chart) {
  this.chart.destroy();
}

        setTimeout(() => this.buildChart(), 80);
      },
      error: (err) => {
        console.error('Failed to load forecasts', err);
      }
    });
}

// moved below: updateForecastPeriod() exists later in file
onCategoryChange() {
  this.loadForecast(this.selectedPeriod);
}


  /* Helpers */

  resetGroups() {
    this.groupedRecs = { high: [], medium: [], low: [], opportunity: [] };
  }

  hasAnyRecommendations() {
    return this.groupOrder.some(g => (this.groupedRecs[g] && this.groupedRecs[g].length > 0));
  }

  getKeyFromPriority(priority: string): 'high' | 'medium' | 'low' | 'opportunity' {
    if (!priority) return 'low';
    const p = priority.toLowerCase();
    if (p.includes('high')) return 'high';
    if (p.includes('medium')) return 'medium';
    if (p.includes('low')) return 'low';
    if (p.includes('opportunity')) return 'opportunity';
    // other synonyms
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

  prettyGroupTitle(k: string) {
    return this.prettyTitleFromKey(k);
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

  buildChart() {
    console.log('Building chart for forecastData:', this.forecastData);
    const ctx = this.chartRef?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.warn('Chart context not ready yet.');
      return;
    }

    if (this.chart instanceof Chart) {
  this.chart.destroy();
}


    // Combine multiple weeks if any
    const labels = this.forecastData.map(d => d.weeks.join(', '));

    const predicted = this.forecastData.map(d => {
      const num = parseFloat((d.prediction && d.prediction[0]) || '0') || 0;
      return num;
    });
    const current = this.forecastData.map(d => {
      const num = parseFloat((d.current || '0').toString().replace('kg','')) || 0;
      return num;
    });

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
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  /* UI handlers */

  toggleGroup(key: string) {
    // toggle only target group (accordion-like only for visual expansion; doesn't collapse others)
    this.groupStates[key] = !this.groupStates[key];
  }

  openRecommendation(rec: RecommendationCard) {
    // open full detail or action - placeholder
    // for now, just open alert or console log - replace with modal or route if needed
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

  trackByRec(index: number, item: RecommendationCard) {
    return item.description || index;
  }

  updateForecastPeriod() {
    this.loadForecast(this.selectedPeriod);
  }

// === Navbar + Sidebar Logic !!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ===
showLogoutModal = false;

toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
  document.body.classList.toggle('sidebar-active', this.sidebarOpen);
}

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
}
