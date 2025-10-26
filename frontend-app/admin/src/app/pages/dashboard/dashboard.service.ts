import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiBase}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    // Default to a 7-day horizon for projected demand
    return this.http.get<any>(`${this.apiUrl}?horizon=7`);
  }
}
