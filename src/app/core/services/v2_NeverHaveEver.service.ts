// maimai-data.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NeverHaveEver } from '../models/v2_NeverHaveEver.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class NeverHaveEverService {
  private apiUrl = environment.apiUrl + '/v2_NeverHaveEver_api.php';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl, { params: { categories: 'true' } })
      .pipe(
        catchError(this.handleError)
      );
  }

  getQuestions(categories: string[] = []): Observable<NeverHaveEver[]> {
    // Join categories into a comma-separated string
    const categoriesStr = categories.join(',');
    let params = new HttpParams().set('questions', 'true').set('categories', categoriesStr);

    return this.http.get<NeverHaveEver[]>(this.apiUrl, { params: params })
      .pipe(
        catchError((error) => {
          console.error('Error on getQuestions', error);
          return throwError(() => error); // o un missatge custom si vols
        })
      );
  }


  private handleError(error: any) {
    console.error('Hi ha hagut un error:', error);
    return throwError(() => new Error(error.message || 'Error del servidor'));
  }
}
