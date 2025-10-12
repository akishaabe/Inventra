import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-forecasting',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NavbarComponent, SidebarComponent],
  templateUrl: './forecasting.html',
  styleUrls: ['./forecasting.css']
})

export class Forecasting implements AfterViewInit {
  sidebarOpen = false; 

  forecastData = [
    {
      product: 'Espresso Beans',
      weeks: ['Sept. 23–27', 'Sept. 30–Oct. 4'],
      prediction: ['45kg', '48kg'],
      current: '38kg',
      action: 'Order 20kg'
    },
    {
      product: 'Croissants',
      weeks: ['Sept. 23–27', 'Sept. 30–Oct. 4'],
      prediction: ['120pcs', '135pcs'],
      current: '84pcs',
      action: 'Order 60pcs'
    }
  ];

  recommendations = [
    {
      title: 'High Priority',
      count: 3,
      description: 'Order 20kg Espresso Beans by Sep 25',
      subtext: 'Current: 38kg → Predicted need: 45kg/week',
      actionText: 'Create Purchase Order',
      priority: 'high-priority'
    },
    {
      title: 'Opportunities',
      count: 2,
      description: 'Promo opportunity: Cold Brew demand',
      subtext: '+25% next week',
      actionText: 'Create Promotion',
      priority: 'opportunity'
    },
    {
      title: 'Reduce Inventory',
      count: 1,
      description: 'Pumpkin syrup',
      subtext: '-15% predicted demand',
      actionText: 'Adjust Order',
      priority: 'reduce'
    }
  ];

  ngAfterViewInit() {
    const ctx = document.getElementById('forecastChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Predicted Demand',
            data: [60, 48, 90, 81, 56, 55, 40],
            borderColor: '#8b1e1e',
            borderWidth: 2,
            fill: false,
            tension: 0.3
          },
          {
            label: 'Current Stock',
            data: [30, 8, 40, 19, 96, 27, 99],
            borderColor: '#3a5f3a',
            borderWidth: 2,
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  openRecommendation(rec: any) {
    alert(`Clicked: ${rec.title}`);
  }
}
