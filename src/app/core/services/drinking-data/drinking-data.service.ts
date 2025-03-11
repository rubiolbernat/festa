import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { DrinkData, CombinedDrinkUserData } from '../../models/drink-data.model';

@Injectable({
  providedIn: 'root'
})
export class DrinkingDataService {

  private apiUrl = environment.apiUrl + '/drinking_api.php';
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // Funció genèrica per fer peticions GET
  private get<T>(action: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    const url = `${this.apiUrl}?action=${action}`;
    console.log(`GET request to: ${url}, with params:`, params);

    return this.http.get<T>(url, { headers: this.defaultHeaders, params: httpParams })
      .pipe(
        /* tap(response => console.log(`Response from ${action}:`, response)),*/
        catchError(this.handleError)
      );
  }

  // Funció genèrica per fer peticions POST
  private post<T>(action: string, body: any): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    console.log(`POST request to: ${url}, with body:`, body);

    return this.http.post<T>(this.apiUrl, body, { headers: this.defaultHeaders })
      .pipe(
        tap(response => console.log(`Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // Envia les dades del formulari al backend
  addDrinkData(drinkData: DrinkData): Observable<any> {
    const user = this.authService.getUser();
    if (!user) {
      console.error('Usuari no autenticat. No es pot enviar les dades.');
      return throwError(() => new Error('Usuari no autenticat.'));
    }
    drinkData.user_id = user.id; // Assigna l'ID de l'usuari
    return this.post('addDrinkData', drinkData); // Utilitza la funció genèrica POST
  }

  // Obté les últimes ubicacions per a l'autocompletat
  getLastLocations(): Observable<string[]> {
    const user = this.authService.getUser();
    if (!user) {
      console.error('Usuari no autenticat. No es pot obtenir les ubicacions.');
      return throwError(() => new Error('Usuari no autenticat.'));
    }
    return this.get<string[]>('getLastLocations', { user_id: user.id });
  }

  // Obté les últimes begudes per a l'autocompletat
  getLastDrinks(): Observable<string[]> {
    const user = this.authService.getUser();
    if (!user) {
      console.error('Usuari no autenticat. No es pot obtenir les begudes.');
      return throwError(() => new Error('Usuari no autenticat.'));
    }
    return this.get<string[]>('getLastDrinks', { user_id: user.id });
  }

  // Obté l'última entrada inserida amb les dades de l'usuari
  getlastinserted(): Observable<CombinedDrinkUserData> {
    return this.get<CombinedDrinkUserData>('getLastInserted');
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Hi ha hagut un error:', error);

    let errorMessage = 'S\'ha produït un error desconegut.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del client: ${error.error.message}`;
      console.error('Error del client:', error.error.message);
    } else {
      errorMessage = `Error del servidor (codi ${error.status}): ${error.message}`;
      console.error(`Error del servidor (codi ${error.status}):`, error.message);
    }

    return throwError(() => error);
  }
}
