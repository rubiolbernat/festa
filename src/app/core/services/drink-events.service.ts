import { AuthService } from './auth/auth.service';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DrinkEvent, EventUser, EventParticipants } from '../models/v2_drink-events.model';

@Injectable({
  providedIn: 'root',
})
export class DrinkEventsService {
  private apiUrl = environment.apiUrl + '/v2/events_api.php';
  private assetsUrl = environment.assetsUrl;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) { }

  getEvents(): Observable<DrinkEvent[]> {
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getFutureEvents`).pipe(
      tap((events: DrinkEvent[]) => console.log('Events:', events)),
      catchError((error: any) => {
        console.error('Error al carregar els esdeveniments:', error);
        throw error;
      })
    );
  }
  getEvents2Weeks(): Observable<DrinkEvent[]> {
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getFuture2WeeksEvents`).pipe(
      tap((events: DrinkEvent[]) => console.log('Events:', events)),
      catchError((error: any) => {
        console.error('Error al carregar els esdeveniments:', error);
        throw error;
      })
    );
  }

  getEventsByUser(user_id: number): Observable<DrinkEvent[]> {
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getMySubscriptions&user_id=${user_id}`).pipe(
      tap((events: DrinkEvent[]) => console.log('Events:', events)),
      catchError((error: any) => {
        console.error('Error al carregar els esdeveniments:', error);
        throw error;
      })
    );
  }

  getEventsByUserId(): Observable<DrinkEvent[]> {
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getMySubscriptions&user_id=${this.authService.getUser()?.id}`).pipe(
      tap((events: DrinkEvent[]) => console.log('Events:', events)),
      catchError((error: any) => {
        console.error('Error al carregar els esdeveniments:', error);
        throw error;
      })
    );
  }

  getEventsByUserIdAndDate(date: string): Observable<DrinkEvent[]> {
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getMySubscriptionsByDate&user_id=${this.authService.getUser()?.id}&date=${date}`).pipe(
      tap((events: DrinkEvent[]) => console.log('Events:', events)),
      catchError((error: any) => {
        console.error('Error al carregar els esdeveniments:', error);
        throw error;
      })
    );
  }


  /*
    getEventsPaginated(limit: number, offset: number, id:number): Observable<EventParticipants[]> {
      return this.http.get<EventParticipants[]>(`${this.apiUrl}?action=getEventsPaginated&limit=${limit}&offset=${offset}&user_id=${id}`)

    }
  */
  getEventsPaginated(limit: number, offset: number, id: number): Observable<EventParticipants[]> {
    const params = new HttpParams()
      .set('action', 'getEventsPaginated')  // Paràmetres per GET
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('user_id', id.toString());  // Add user_id as a query parameter

    return this.http.get<EventParticipants[]>(this.apiUrl, { params, });
  }



  getEventStatsData(event_id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?action=getEventStats&event_id=${event_id}`).pipe(
      tap((stats: any) => console.log('Event Stats Data:', stats)),
      catchError((error: any) => {
        console.error('Error fetching event stats data:', error);
        throw error;
      })
    );
  }


  getEvent(eventId: number): Observable<DrinkEvent> {
    return this.http.get<DrinkEvent>(`${this.apiUrl}?action=${eventId}`);
  }

  getEventbyDate(date: string): Observable<DrinkEvent[]> {
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getEventbyDate&date=${date}`);
  }

  getEventDetails(eventId: number): Observable<EventParticipants> {
    return this.http.get<EventParticipants>(`${this.apiUrl}?action=getEventDetails&eventId=${eventId}`);
  }

  getEventParticipants(eventId: number): Observable<EventUser[]> {
    return this.http.get<EventUser[]>(`${this.apiUrl}?action=getEventParticipants&eventId=${eventId}`);
  }

  createEvent(event: any): Observable<DrinkEvent> {
    return this.http.post<DrinkEvent>(`${this.apiUrl}?action=addEvent`, event).pipe(
      tap((newEvent: DrinkEvent) => console.log('New Event:', newEvent)),
      catchError((error: any) => {
        console.error('Error creating event:', error);
        throw error;
      })
    );
  }

  enrollInEvent(eventId: number, userId: number | null): Observable<any> {
    if (!userId) {
      const errorMsg = 'Intent d’inscriure amb userId nul o invàlid.';
      console.warn(errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    // 1. Defineix l'acció que anirà a la URL
    const action = 'signUp';
    const urlWithAction = `${this.apiUrl}?action=${action}`;

    console.log(`Target URL for POST: ${urlWithAction}`); // Verifica la URL

    // 3. Construeix el BODY del POST només amb event_id i user_id
    const bodyParams = new HttpParams()
      // NO AFEGIM 'action' aquí
      .set('event_id', eventId.toString())
      .set('user_id', userId.toString());

    console.log(`Request Body (form-urlencoded): ${bodyParams.toString()}`); // Verifica el body

    // 4. Fes la sol·licitud POST a la URL modificada, passant les dades al body
    return this.http.post<any>(
      urlWithAction,          // URL que ja conté ?action=signUp
      bodyParams.toString(),  // Cos de la sol·licitud amb les dades (cal convertir a string)
      {
        // Capçalera necessària per a POST amb dades form-urlencoded
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).pipe(
      tap(response => console.log('Enrollment response (POST with action in URL):', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Error enrolling in event (POST with action in URL):', error);
        return throwError(() => error);
      })
    );
  }


  unenrollFromEvent(eventId: number, userId: number | null): Observable<any> {
    const body = new HttpParams()
      .set('event_id', eventId.toString())
      .set('user_id', userId ? userId.toString() : '0'); // O obtenir de sessió/token a PHP

    // Afegeix 'action=unsign' com a GET a l'URL
    const urlWithAction = `${this.apiUrl}?action=unsign`;

    return this.http.post<any>(urlWithAction, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(response => console.log('Unenrollment response:', response)),
      catchError((error: any) => {
        console.error('Error unenrolling from event:', error);
        throw error; // Propaga l'error
      })
    );
  }
}

function throwError(arg0: () => Error): Observable<any> {
  throw new Error('Function not implemented.');
}

