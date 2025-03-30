import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
    const url = `${this.apiUrl}?action=${action}`;
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    //console.log(`GET request to: ${url} with params: ${JSON.stringify(params)}`);

    return this.http.get<T>(url, { headers: this.defaultHeaders, params: httpParams })
      .pipe(
        //tap(response => console.log(`Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // Funció genèrica per fer peticions POST (JSON)
  private post<T>(action: string, body: any): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    console.log(`POST request to: ${url} with body: ${JSON.stringify(body)}`);
    return this.http.post<T>(url, body, { headers: this.defaultHeaders })
      .pipe(
        tap(response => console.log(`Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // Funció per fer peticions POST amb FormData (sense Content-Type: application/json)
  uploadFormData(action: string, formData: FormData): Observable<HttpEvent<any>> {
    const url = `${this.apiUrl}?action=${action}`;
    console.log(`POST request to: ${url} with FormData`);

    return this.http.post<any>(url, formData, {
      reportProgress: true, // Per rebre esdeveniments de progrés
      observe: 'events'       // Per observar tots els esdeveniments (incloent-hi el progrés)
    }).pipe(
      tap(response => console.log(`Response from ${action}:`, response)),
      catchError(this.handleError)
    );
  }

  // Funció genèrica per fer peticions PUT
  private put<T>(action: string, body: any): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    console.log(`PUT request to: ${url} with body: ${JSON.stringify(body)}`);
    return this.http.put<T>(url, body, { headers: this.defaultHeaders })
      .pipe(
        tap(response => console.log(`Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // Funció genèrica per fer peticions DELETE
  private delete<T>(action: string, id: number): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    const body = { id }; // Crea un objeto con la propiedad id
    console.log(`DELETE request to: ${url} with body: ${JSON.stringify(body)}`);

    return this.http.request<T>('delete', url, { headers: this.defaultHeaders, body: body })
      .pipe(
        tap(response => console.log(`Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // Envia les dades del formulari al backend (ara utilitza FormData)
  addDrinkData(formData: FormData): Observable<HttpEvent<any>> {
    const user = this.authService.getUser();
    if (!user) {
      console.error('Usuari no autenticat. No es pot enviar les dades.');
      return throwError(() => new Error('Usuari no autenticat.'));
    }
    formData.append('user_id', user.id.toString()); // Afegir user_id al FormData
    return this.uploadFormData('addDrinkData', formData); // Utilitza uploadFormData
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

  getInsertsPaginated(limit: number, offset: number): Observable<CombinedDrinkUserData[]> {
    const params = { limit: limit.toString(), offset: offset.toString() };
    //console.log('Paràmetres per getInsertsPaginated:', params);

    const observable = this.get<CombinedDrinkUserData[]>('getInsertsPaginated', params);
    /*
    observable.subscribe(
      (data) => console.log('Dades rebudes:', data),
      (error) => console.error('Error en getInsertsPaginated:', error)
    );
    */

    return observable;
  }

  getDrinkDataById(id: number): Observable<DrinkData> {
    return this.get<DrinkData>('getDrinkDataById', { id: id });
  }

  getDataByUserId(userId: number): Observable<DrinkData[]> {
    return this.get<DrinkData[]>('getDataByUserId', { user_id: userId });
  }

  deleteDrinkData(id: number): Observable<any> {
    return this.delete('deleteDrinkData', id);
  }

  updateDrinkData(drinkData: DrinkData): Observable<any> {
    return this.put('updateDrinkData', drinkData);
  }
  // Obté les dades d'estadístiques per a un usuari
  getStatsData(): Observable<any> {
    const user = this.authService.getUser();
    if (!user) {
      console.error('Usuari no autenticat. No es pot obtenir les ubicacions.');
      return throwError(() => new Error('Usuari no autenticat.'));
    }
    return this.get<any>('getStatsData', { user_id: user.id });
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

  getStoriesByUser(userId: number): Observable<any[]> {
    // Replace the following line with the actual implementation to fetch stories
    return this.get<any[]>('getStoriesByUser', { user_id: userId });
  }
}
