import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:4000/api/admin/inventory';


  constructor(private http: HttpClient) {}

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProduct(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addProduct(item: any): Observable<any> {
    // backend expects { product_id, quantity }
    const body = {
      product_id: item.id,
      quantity: item.quantity ?? 0
    };
    return this.http.post(this.apiUrl, body);
  }

  updateProduct(id: string, item: any): Observable<any> {
    // backend only updates quantity
    const body = { quantity: item.quantity ?? 0 };
    return this.http.put(`${this.apiUrl}/${id}`, body);
  }

  deleteProducts(ids: string[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { ids } });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
