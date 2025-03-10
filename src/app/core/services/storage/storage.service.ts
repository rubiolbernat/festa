import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProductItemCart } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})

export class StorageService {
  private readonly EXPIRATION_TIME = 24 * 60 * 60 * 1000 * 15; // 15 days in milliseconds

  constructor() { }

  loadProducts(): Observable<ProductItemCart[]> {
    const rawproducts = localStorage.getItem('products');
    const timestamp = localStorage.getItem('products_timestamp');
    if (rawproducts && timestamp) {
      const currentTime = new Date().getTime();
      if (currentTime - parseInt(timestamp, 10) < this.EXPIRATION_TIME) {
        return of(JSON.parse(rawproducts));
      } else {
        this.clearProducts();
      }
    }
    return of([]);
  }

  saveProducts(products: ProductItemCart[]): void {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('products_timestamp', new Date().getTime().toString());
  }

  clearProducts(): void {
    localStorage.removeItem('products');
    localStorage.removeItem('products_timestamp');
  }
}
