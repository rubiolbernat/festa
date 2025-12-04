import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

// Defineix una interfície per a la resposta de l'API per a una millor tipificació
export interface locationData {
  location: number,
  latitude: number,
  longitude: number,
  total_litres: number
}

export interface UserStatsResponse {
  user_id: number;
  date_range: {
    start_date: string | null;
    end_date: string | null;
  };
  generalStats: any; // Ajusta segons la teva estructura real
  topDay: any;
  topSpendingDay: any;
  topLocationByQuantity: any;
  topLocationBySpending: any;
  topDrinkByQuantity: any;
  topDrinkByAveragePrice: any;
  weeklyStats: any[];
  monthlySummary: any[];
  userLocationData: locationData[];
  mostConsumedDrinks: any[];
  userWrappedStats: any;
  userEvents: any[];
  userDrinkerRank: {
    rank: number | null;
    total_users: number;
  };
  // Afegeix altres camps que retorni la teva API
}

@Injectable({
  providedIn: 'root'
})
export class WrappedService {

  private apiUrl = environment.apiUrl + '/drinking_wrapped.php';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // BehaviorSubject per emmagatzemar i notificar els components sobre les dades carregades
  // S'inicialitza amb null per indicar que les dades encara no s'han carregat
  private _wrappedData = new BehaviorSubject<UserStatsResponse | null>(null);
  // Observable públic per a que els components puguin subscriure's
  public wrappedData$ = this._wrappedData.asObservable();

  private fullscreenSource = new BehaviorSubject<boolean>(false);
  fullscreenStatus$ = this.fullscreenSource.asObservable();
  // Opcions seleccionades i dates per a la càrrega de dades
  // Les fem públiques per si algun component necessita saber quina configuració es va utilitzar
  public currentSelectedOption: 'this-year' | 'all-time' | 'custom' = 'this-year';
  public currentStartDate: string | null = null;
  public currentEndDate: string | null = null;

  constructor() { }

  private defaultJsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  private get<T>(action: string, params?: any): Observable<T> {
    const url = `${this.apiUrl}?action=${action}`;
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T>(url, { headers: this.defaultJsonHeaders, params: httpParams })
      .pipe(catchError(this.handleError));
  }

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

  /**
   * Calcula les dates d'inici i fi segons l'opció seleccionada.
   * @param option 'this-year', 'all-time' o 'custom'.
   * @param customStartDate (Opcional) Data d'inici personalitzada.
   * @param customEndDate (Opcional) Data de fi personalitzada.
   * @returns Un objecte amb startDate i endDate.
   */
  private calculateDates(
    option: 'this-year' | 'all-time' | 'custom',
    customStartDate: string | null = null,
    customEndDate: string | null = null
  ): { startDate: string | null, endDate: string | null } {
    const today = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;
    //console.log('calculateDates cridat amb:', { option, customStartDate, customEndDate });
    switch (option) {
      case 'this-year':
        startDate = `${today.getFullYear()}-01-01`;
        endDate = `${today.getFullYear()}-12-31`; // O la data actual si només vols fins avui
        // Si vols fins avui: endDate = today.toISOString().slice(0, 10);
        break;
      case 'all-time':
        startDate = null; // L'API PHP ha de gestionar nulls per a "tot el temps"
        endDate = null;
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
    }
    return { startDate, endDate };
  }

  /**
   * Carrega les dades del "Wrapped" de l'usuari segons l'opció i les dates especificades.
   * Un cop carregades, les emmagatzema internament i les emet a través de wrappedData$.
   *
   * @param selectedOption L'opció de rang de temps ('this-year', 'all-time', 'custom').
   * @param customStartDate Data d'inici personalitzada (requerida si selectedOption és 'custom').
   * @param customEndDate Data de fi personalitzada (requerida si selectedOption és 'custom').
   * @returns Un Observable de les dades carregades.
   */
  loadWrappedData(
    selectedOption: 'this-year' | 'all-time' | 'custom' = 'this-year',
    customStartDate: string | null = null,
    customEndDate: string | null = null
  ): Observable<UserStatsResponse> {
    this.currentSelectedOption = selectedOption;
    this.currentStartDate = customStartDate;
    this.currentEndDate = customEndDate;

    const { startDate, endDate } = this.calculateDates(selectedOption, customStartDate, customEndDate);

    const user = this.authService.getUser();
    const userId = user ? user.id : -1;

    const params: { [key: string]: any } = { user_id: userId };
    if (startDate) params['start_date'] = startDate;
    if (endDate) params['end_date'] = endDate;

    return this.get<UserStatsResponse>('getStatsData', params).pipe(
      tap(data => {
        console.log('Dades del Wrapped rebudes:', data);
        this._wrappedData.next(data);
      }),
      catchError(err => {
        console.error('Error en carregar les dades del Wrapped:', err);
        return throwError(() => err);
      })
    );
  }


  /**
   * Retorna les dades del Wrapped emmagatzemades actualment.
   * Útil si el component necessita l'última instantània de les dades sense subscriure's.
   * @returns Les dades del Wrapped o null si no s'han carregat.
   */
  getWrappedData(): UserStatsResponse | null {
    return this._wrappedData.getValue();
  }

  /**
   * Neteja les dades del Wrapped si no són necessàries.
   */
  clearWrappedData(): void {
    this._wrappedData.next(null);
  }

  getlocationData(): locationData[] | null {
    const data = this._wrappedData.getValue();
    return data ? data.userLocationData : null;
  }

  getMaxLocationLitres(): number {
    const locationData = this.getlocationData();
    if (!locationData || locationData.length === 0) return 0;
    return Math.max(...locationData.map(loc => loc.total_litres));
  }

  getMaxDayOfWeek(): any | null {
    const data = this._wrappedData.getValue();
    if (!data || !data.weeklyStats || data.weeklyStats.length === 0) return null;

    const maxDay = data.weeklyStats.reduce((prev, current) =>
      parseFloat(current.total_quantitat) > parseFloat(prev.total_quantitat) ? current : prev
    );

    const dayNames = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
    const dayName = dayNames[maxDay.day_of_week - 1]; // ajustat a 1 = Dilluns, 7 = Diumenge

    return { ...maxDay, dayName };
  }

  getMaxDayName(): string | null {
    const result = this.getMaxDayOfWeek();
    return result ? result.dayName : null;
  }

  setFullscreenState(isFullScreen: boolean) {
    this.fullscreenSource.next(isFullScreen);
  }

}
