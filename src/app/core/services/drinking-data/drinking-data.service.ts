
// drinking-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DrinkData } from '../../models/drink-data.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DrinkingService {
  private apiUrl = `${environment.apiUrl}/drinking_api.php`;

  constructor(private http: HttpClient) { }

  addDrinkData(drinkData: DrinkData): Observable<any> {
    return this.http.post(this.apiUrl, drinkData);
  }
}
