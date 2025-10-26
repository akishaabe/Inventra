// settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiBase}/admin/settings`;

  constructor(private http: HttpClient) {}

  // Get all users (list)
  getAllUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl); // GET /api/admin/settings
  }

  // Get single user by id
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`); // GET /api/admin/settings/:id
  }

  // Get user by email (from /api/users)
  getUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBase}/users/by-email`, {
      params: { email }
    });
  }

  // Alias - same as getUserById (keeps names used in components)
  getAdminProfile(id: number): Observable<any> {
    return this.getUserById(id);
  }

  // Create user
  addUser(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data); // POST /api/admin/settings
  }

  // Update general user
  updateUser(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data); // PUT /api/admin/settings/:id
  }

  // Update admin profile (special endpoint)
  updateAdminProfile(id: number, adminData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/${id}`, adminData); // PUT /api/admin/settings/admin/:id
  }

  // Delete user
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`); // DELETE /api/admin/settings/:id
  }
}
