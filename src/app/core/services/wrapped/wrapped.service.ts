import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WrappedService {

  private apiUrl = environment.apiUrl + '/wrapped_api.php';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  selectedOption: 'this-year' | 'all-time' | 'custom' = 'this-year';
  startDate!: string;
  endDate!: string;

  constructor() { }

  generateWrapped(selectedOption: 'this-year' | 'all-time' | 'custom' = 'this-year', startDate: string, endDate: string) {
    this.selectedOption = selectedOption;
    this.startDate = startDate;
    this.endDate = endDate;

    //this.fetchData();
  }

  private defaultJsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

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

  fetchData(dateStart: string, dateEnd: string): Observable<any> {
    const user = this.authService.getUser();
    //if (!user) return throwError(() => new Error('Usuari no autenticat.'));

    const params = {
      user_id: user ? user.id : -1,
      'date-start': dateStart,
      'date-end': dateEnd
    };

    return this.get<any>('getWrapped', params);
  }
}
