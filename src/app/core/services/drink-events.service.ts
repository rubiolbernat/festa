import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<DrinkEvent[]>(`${this.apiUrl}?action=getEvents`).pipe(
      tap((events: DrinkEvent[]) => console.log('Events:', events)),
      catchError((error: any) => {
        console.error('Error al carregar els esdeveniments:', error);
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

  createEvent(event: DrinkEvent): Observable<DrinkEvent> {
    return this.http.post<DrinkEvent>(`${this.apiUrl}?action=createEvent`, event).pipe(
      tap((newEvent: DrinkEvent) => console.log('New Event:', newEvent)),
      catchError((error: any) => {
        console.error('Error creating event:', error);
        throw error;
      })
    );
  }
}
