import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../models/product.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = environment.apiUrl + '/shop.php';
  private assetsUrl = environment.assetsUrl;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?all=1`)
      .pipe(
        map((products: Product[]) => {
          return products.map(product => {
            return {
              ...product,
              images: product.images.map(image => this.assetsUrl + image) // Concatena la URL base amb cada nom de fitxer
            };
          });
        })
      );
  }
}
