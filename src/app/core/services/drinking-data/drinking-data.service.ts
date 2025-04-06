import { Injectable, inject } from '@angular/core';
// Assegura't que HttpEventType està importat si uses uploadFormData amb progrés
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
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
  // Capçalera per a peticions que envien/esperen JSON
  private defaultJsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // --- Mètodes Privats Genèrics (Ús amb precaució) ---

  // GET: Correcte, action i params a la URL
  private get<T>(action: string, params?: any): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<T>(url, { headers: this.defaultJsonHeaders, params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // POST amb FormData: Correcte per 'addDrinkData' amb imatge, action dins FormData
  uploadFormData(action: string, formData: FormData): Observable<HttpEvent<any>> {
    const url = this.apiUrl;
    formData.append('action', action);
    console.log(`POST (FormData) request to: ${url} (Action '${action}' in FormData)`);
    return this.http.post<any>(url, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(catchError(this.handleError));
  }

  // POST amb JSON: Action a la URL. Útil si algun POST PHP ho espera així.
  private postJson<T>(action: string, body: any): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    console.log(`POST (JSON) request to: ${url} with body: ${JSON.stringify(body)}`);
    return this.http.post<T>(url, body, { headers: this.defaultJsonHeaders })
      .pipe(
        tap(response => console.log(`POST (JSON) Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // PUT genèric: Action a la URL. NO l'usarem per updateDrinkData.
  private put<T>(action: string, body: any): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    console.warn(`Generic PUT called (action in URL, might be wrong): ${url}`);
    return this.http.put<T>(url, body, { headers: this.defaultJsonHeaders })
      .pipe(
        tap(response => console.log(`Generic PUT Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // DELETE genèric: Action a la URL, envia body (pot ser incorrecte). NO l'usarem.
  private deleteGeneric<T>(action: string, id: number): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    const body = { id };
    console.warn(`Generic DELETE called (action in URL, body sent): ${url}`);
    return this.http.request<T>('delete', url, { headers: this.defaultJsonHeaders, body: body })
      .pipe(
        tap(response => console.log(`Generic DELETE Response from ${action}:`, response)),
        catchError(this.handleError)
      );
  }

  // --- Mètodes Públics Específics ---

  // ADD (Correcte, usa uploadFormData)
  addDrinkData(formData: FormData): Observable<HttpEvent<any>> {
    const user = this.authService.getUser();
    if (!user) {
      return throwError(() => new Error('Usuari no autenticat.'));
    }
    formData.append('user_id', user.id.toString());
    // uploadFormData ja afegeix l'action dins del FormData
    return this.uploadFormData('addDrinkData', formData);
  }

  // UPDATE (Correcte, envia JSON amb 'action' al body via PUT directe)
  updateDrinkData(drinkData: DrinkData): Observable<any> {
    const user = this.authService.getUser();
    if (!user) {
      return throwError(() => new Error('Usuari no autenticat.'));
    }
    if (drinkData.id === undefined || drinkData.id === null || drinkData.id <= 0) {
      return throwError(() => new Error('ID de registre no vàlid per actualitzar.'));
    }

    const { user_id, ...filteredDrinkData } = drinkData; // Remove user_id if it exists in drinkData
    const dataToSend = {
      action: 'updateDrinkData', // <-- L'acció dins del JSON
      user_id: user.id,       // <-- user_id per seguretat/validació al backend
      ...filteredDrinkData     // <-- La resta de les dades (inclou l'id)
    };

    const url = this.apiUrl; // URL base
    console.log(`Sending specific PUT request to: ${url} with JSON body:`, dataToSend);

    return this.http.put<any>(url, dataToSend, { headers: this.defaultJsonHeaders }).pipe(
      tap(response => console.log('Server response from PUT updateDrinkData:', response)),
      catchError(this.handleError)
    );
  }

  // DELETE (CORREGIT - Envia 'action', 'id', 'user_id' com a paràmetres a la URL)
  deleteDrinkData(id: number): Observable<any> {
    const user = this.authService.getUser();
    if (!user) {
      return throwError(() => new Error('Usuari no autenticat.'));
    }

    // 1. Acció va a la URL
    const action = 'deleteDrinkData';
    const url = `${this.apiUrl}?action=${action}`; // Només l'acció a la URL

    // 2. Prepara el body JSON NOMÉS amb l'ID (i user_id si el backend el necessita aquí)
    //    El teu PHP actual només sembla llegir 'id' del body per DELETE,
    //    però és bona pràctica enviar user_id per la comprovació de permisos.
    //    Si el teu PHP per DELETE realment només usa l'ID del body, pots treure user_id d'aquí.
    const bodyToSend = {
      id: id
      // user_id: user.id // Afegeix si el PHP de DELETE el llegeix del body
    };

    console.log(`Sending specific DELETE request to: ${url} with JSON body:`, bodyToSend);

    // 3. Crida a http.request('delete') enviant el body JSON
    return this.http.request<any>('delete', url, {
      headers: this.defaultJsonHeaders,
      body: bodyToSend // <-- Envia l'ID al cos
    }).pipe(
      tap(response => console.log('Server response from DELETE deleteDrinkData:', response)),
      catchError(this.handleError)
    );
  }

  // --- Mètodes GET (Es mantenen igual, usen el 'get' privat) ---
  getLastLocations(): Observable<string[]> {
    const user = this.authService.getUser();
    if (!user) return throwError(() => new Error('Usuari no autenticat.'));
    return this.get<string[]>('getLastLocations', { user_id: user.id });
  }

  getLastDrinks(): Observable<string[]> {
    const user = this.authService.getUser();
    if (!user) return throwError(() => new Error('Usuari no autenticat.'));
    return this.get<string[]>('getLastDrinks', { user_id: user.id });
  }

  getlastinserted(): Observable<CombinedDrinkUserData> {
    const user = this.authService.getUser();
    return this.get<CombinedDrinkUserData>('getLastInserted', user ? { user_id: user.id } : {});
  }

  getInsertsPaginated(limit: number, offset: number): Observable<CombinedDrinkUserData[]> {
    const user = this.authService.getUser();
    const params: any = { limit: limit.toString(), offset: offset.toString() };
    if (user) { params.user_id = user.id; }
    return this.get<CombinedDrinkUserData[]>('getInsertsPaginated', params);
  }

  getDrinkDataById(id: number): Observable<DrinkData> {
    const user = this.authService.getUser();
    const params: any = { id: id };
    if (user) { params.user_id = user.id; }
    return this.get<DrinkData>('getDrinkDataById', params);
  }

  getDataByUserId(userId: number): Observable<DrinkData[]> {
    // Considerar lògica de permisos aquí si és necessari
    return this.get<DrinkData[]>('getDataByUserId', { user_id: userId });
  }

  getStatsData(): Observable<any> {
    const user = this.authService.getUser();
    if (!user) return throwError(() => new Error('Usuari no autenticat.'));
    return this.get<any>('getStatsData', { user_id: user.id });
  }

  getStoriesByUser(userId: number): Observable<any[]> {
    return this.get<any[]>('getStoriesByUser', { user_id: userId });
  }

  // --- Gestor d'Errors ---
  private handleError(error: HttpErrorResponse) {
    console.error('S\'ha produït un error en la petició API:', error);
    let errorMessage = 'Error desconegut al contactar amb el servidor.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del client o de xarxa: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage = 'No s\'ha pogut connectar amb el servidor. Verifica la connexió o la URL de l\'API.';
    }
    else {
      const serverErrorMsg = error.error?.message || error.error?.error || (typeof error.error === 'string' ? error.error : error.message);
      errorMessage = `Error del servidor (${error.status}): ${serverErrorMsg}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  getStatsDataDates(dateStart: string, dateEnd: string): Observable<any> {
    const user = this.authService.getUser();
    //if (!user) return throwError(() => new Error('Usuari no autenticat.'));

    const params = {
      user_id: user ? user.id : -1,
      'date-start': dateStart,
      'date-end': dateEnd
    };

    return this.get<any>('getSpecialsDateStats', params);
  }
  /*
  // Exemple d'ús del mètode getStatsDataDates
  this.statsService.getStatsData('2025-04-01', '2025-04-06').subscribe(
    data => console.log(data),
    err => console.error(err)
  );
  */

}
