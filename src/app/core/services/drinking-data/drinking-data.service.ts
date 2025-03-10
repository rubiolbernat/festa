import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface DrinkData {
  user_id: number;
  date: string;
  day_of_week: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  drink: string;
  quantity: number;
  others: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class DrinkingDataService {

  private apiUrl = environment.apiUrl + '/drinking_api.php'; // Ajusta la ruta
  private http = inject(HttpClient); // Inject HttpClient
  private authService = inject(AuthService); // Inject AuthService

  // Envia les dades del formulari al backend
  addDrinkData(drinkData: DrinkData): Observable<any> {
    const user = this.authService.getUser();
    if (!user) {
      console.error('Usuari no autenticat. No es pot enviar les dades.');
      return throwError(() => new Error('Usuari no autenticat.'));
    }

    drinkData.user_id = user.userId; // Assigna l'ID de l'usuari des del AuthService

    // Afegeix la capçalera d'autorització (si cal)
    //const token = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      //'Authorization': `Bearer ${token}` // Reemplaça amb el teu esquema d'autorització
    });

    console.log('Enviant dades al backend:', drinkData);
    return this.http.post(this.apiUrl, drinkData, { headers: headers })
      .pipe(
        tap(response => console.log('Resposta del backend:', response)),
        catchError(this.handleError)
      );
  }

  getLastLocations(userId: number): Observable<string[]> {
    console.log(`Obtenint ubicacions anteriors per a l'usuari ${userId}`);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}?action=getLastLocations&user_id=${userId}`;
    console.log('URL de la petició:', url);
    console.log("Crida a ultim llocs", url, headers);
    return this.http.get<string[]>(url, { headers: headers })
      .pipe(
        tap(response => {
          console.log('Resposta rebuda abans del console.log:', response); // <-- AFEGEIX AIXÒ
        }),
        tap(response => console.log('Ubicacions obtingudes:', response)),
        catchError(this.handleError)
      );
  }

  // Obté les begudes anteriors per a l'autocompletat
  getLastDrinks(userId: number): Observable<string[]> {
    // const user = this.authService.getUser();
    // if (!user) {
    //   console.error('Usuari no autenticat. No es pot obtenir les begudes.');
    //   return throwError(() => new Error('Usuari no autenticat.'));
    // }

    //const userId = user.userId; //Eliminem
    console.log(`Obtenint begudes anteriors per a l'usuari ${userId}`);

    // Afegeix la capçalera d'autorització (si cal)
    //const token = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      //'Authorization': `Bearer ${token}` // Reemplaça amb el teu esquema d'autorització
    });

    const url = `${this.apiUrl}?action=getLastDrinks&user_id=${userId}`;
    console.log('URL de la petició:', url);
    console.log("Crida a ultimes begudes", url, headers);
    return this.http.get<string[]>(url, { headers: headers })
      .pipe(
        tap(response => console.log('Begudes obtingudes:', response)),
        // map(response => response.body || []), // <-- Afegeix map per extreure el body
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Hi ha hagut un error:', error);

    let errorMessage = 'S\'ha produït un error desconegut.';
    if (error.error instanceof ErrorEvent) {
      // Error del client
      errorMessage = `Error del client: ${error.error.message}`;
      console.error('Error del client:', error.error.message);
    } else {
      // Error del servidor
      errorMessage = `Error del servidor (codi ${error.status}): ${error.message}`;
      console.error(`Error del servidor (codi ${error.status}):`, error.message);
    }

    // Retorna un observable amb un missatge d'error amigable
    return throwError(() => error);
  }
}
