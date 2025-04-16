import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DrinkEvent, EventUser, EventParticipants } from '../models/v2_drink-events.model';

@Injectable({
  providedIn: 'root',
})
export class DrinkEventsService {
  private apiUrl = environment.apiUrl + '/v2/events_api.php';
  private assetsUrl = environment.assetsUrl;

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

  getEventsByUser(user_id: number): Observable<DrinkEvent[]> {
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getMySubscriptions&user_id=${user_id}`).pipe(
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
      console.warn('Intent d’inscriure amb userId nul');
      return throwError(() => new Error('Usuari no vàlid'));
    }

    const body = new HttpParams()
      .set('action', 'signUp')
      .set('event_id', eventId.toString())
      .set('user_id', userId.toString());

    return this.http.post<any>(this.apiUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(response => console.log('Enrollment response:', response)),
      catchError((error: any) => {
        console.error('Error enrolling in event:', error);
        throw error;
      })
    );
  }


  unenrollFromEvent(eventId: number, userId: number | null): Observable<any> {
    // Normalment les eliminacions es fan amb DELETE, però si l'API espera POST:
    const body = new HttpParams()
      .set('action', 'unsign') // Nova acció PHP
      .set('event_id', eventId.toString())
      .set('user_id', userId ? userId.toString() : 0); // O obtenir de sessió/token a PHP

    // Utilitzant POST com per 'enroll':
    return this.http.post<any>(this.apiUrl, body, {
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

