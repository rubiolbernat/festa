import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DrinkService {
  private baseUrl = `${environment.apiUrl}/drink-data.php`;

  constructor(private http: HttpClient) {}

  // Obtenir les últimes ubicacions
  getLastLocations(userId: number): Observable<string[]> {
    const params = new HttpParams().set('user_id', userId).set('action', 'getLastLocations');
    return this.http.get<string[]>(`${this.baseUrl}`, { params });
  }

  // Obtenir les últimes begudes
  getLastDrinks(userId: number): Observable<string[]> {
    const params = new HttpParams().set('user_id', userId).set('action', 'getLastDrinks');
    return this.http.get<string[]>(`${this.baseUrl}`, { params });
  }

  // Enviar dades de begudes
  submitDrinkData(drinkData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}`, drinkData, { headers });
  }
}
