// maimai-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Pregunta } from '../../models/Pregunta';
@Injectable({
  providedIn: 'root'
})
export class MaimaiDataService {
  private apiUrl = environment.apiUrl + '/jo_maimai_api.php';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl, { params: { categories: 'true' } })
      .pipe(
        catchError(this.handleError)
      );
  }

  getPreguntas(categorias: string[]): Observable<Pregunta[]> {
    const categoriasStr = categorias.join(','); // Unir las categorías en una cadena separada por comas
    let params = new HttpParams().set('preguntas', 'true').set('categorias', categoriasStr);

    return this.http.get<Pregunta[]>(this.apiUrl, { params: params })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('Hi ha hagut un error:', error);
    return throwError(() => new Error(error.message || 'Error del servidor'));
  }
}
