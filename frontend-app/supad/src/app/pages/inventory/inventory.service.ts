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

  getProducts(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/products`);
}

  getNextProductId(): Observable<{ nextId: string }> {
    return this.http.get<{ nextId: string }>(`${this.apiUrl}/next-id`);
  }



addProduct(item: any): Observable<any> {
  return this.http.post(this.apiUrl, item);
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
