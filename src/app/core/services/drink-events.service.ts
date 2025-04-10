import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DrinkEvent, EventUser, ApiResponse, CreateEventData, UpdateEventData, EventFilter } from '../models/drink-events.model'; // Ajusta la ruta si cal

@Injectable({
  providedIn: 'root' // Servei disponible a tota l'aplicació
})
export class EventService {

  private apiUrl = environment.apiUrl; // URL base de l'API des de l'entorn

  constructor(private http: HttpClient) { }

  /**
   * Obté una llista d'esdeveniments, opcionalment filtrada.
   * @param filter Tipus de filtre ('upcoming', 'past', 'next', 'date', 'all')
   * @param date Data per al filtre 'date' (format YYYY-MM-DD)
   * @returns Observable amb l'array d'esdeveniments o un event únic si filter='next'
   */
  getEvents(filter: EventFilter = 'all', date?: string): Observable<DrinkEvent[] | DrinkEvent | null> {
    let params = new HttpParams().set('action', 'events');

    if (filter !== 'all') {
      params = params.set('filter', filter);
      if (filter === 'date' && date) {
        params = params.set('date', date);
      }
    }

    // El filtre 'next' retorna un sol objecte o null/404, no un array
    if (filter === 'next') {
      return this.http.get<DrinkEvent | null>(this.apiUrl, { params }).pipe(
        catchError(error => {
          // Si l'API retorna 404 per 'next' quan no n'hi ha, retornem null
          if (error.status === 404) {
            return of(null);
          }
          // Propaga altres errors
          throw error;
        })
      );
    } else {
      return this.http.get<DrinkEvent[]>(this.apiUrl, { params });
    }
  }

  /**
   * Obté el pròxim esdeveniment. Wrapper per a getEvents('next').
   * @returns Observable amb el pròxim esdeveniment o null si no n'hi ha.
   */
  getNextEvent(): Observable<DrinkEvent | null> {
    // Assegurem que el tipus retornat sigui DrinkEvent | null
    return this.getEvents('next') as Observable<DrinkEvent | null>;
  }

  /**
   * Obté un esdeveniment específic pel seu ID.
   * @param id ID de l'esdeveniment
   * @returns Observable amb les dades de l'esdeveniment.
   */
  getEventById(id: number): Observable<DrinkEvent> {
    const params = new HttpParams()
      .set('action', 'event')
      .set('id', id.toString());
    return this.http.get<DrinkEvent>(this.apiUrl, { params });
  }

  /**
   * Crea un nou esdeveniment.
   * @param eventData Dades del nou esdeveniment (nom, data_inici, data_fi, opcions?)
   * @returns Observable amb la resposta de l'API (missatge, event_id).
   */
  createEvent(eventData: CreateEventData): Observable<ApiResponse> {
    const params = new HttpParams().set('action', 'events');
    // Les dades van al body de la petició POST
    return this.http.post<ApiResponse>(this.apiUrl, eventData, { params });
  }

  /**
   * Actualitza un esdeveniment existent.
   * @param id ID de l'esdeveniment a actualitzar.
   * @param eventData Dades a actualitzar (nom?, data_inici?, data_fi?, opcions?).
   * @returns Observable amb la resposta de l'API (missatge).
   */
  updateEvent(id: number, eventData: UpdateEventData): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('action', 'event')
      .set('id', id.toString());
    // Les dades van al body de la petició PUT
    return this.http.put<ApiResponse>(this.apiUrl, eventData, { params });
  }

  /**
   * Elimina un esdeveniment.
   * @param id ID de l'esdeveniment a eliminar.
   * @returns Observable amb la resposta de l'API (missatge).
   */
  deleteEvent(id: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('action', 'event')
      .set('id', id.toString());
    return this.http.delete<ApiResponse>(this.apiUrl, { params });
  }

  // --- Gestió d'Inscripcions ---

  /**
   * Inscriu un usuari a un esdeveniment.
   * @param eventId ID de l'esdeveniment.
   * @param userId ID de l'usuari.
   * @returns Observable amb la resposta de l'API (missatge).
   */
  signUpUser(eventId: number, userId: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('action', 'signup')
      .set('event_id', eventId.toString())
      .set('user_id', userId.toString());
    // POST pot no necessitar body si tota la info va als params
    return this.http.post<ApiResponse>(this.apiUrl, null, { params });
  }

  /**
   * Desinscriu un usuari d'un esdeveniment.
   * @param eventId ID de l'esdeveniment.
   * @param userId ID de l'usuari.
   * @returns Observable amb la resposta de l'API (missatge).
   */
  unsignUpUser(eventId: number, userId: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('action', 'signup')
      .set('event_id', eventId.toString())
      .set('user_id', userId.toString());
    return this.http.delete<ApiResponse>(this.apiUrl, { params });
  }

  /**
   * Obté la llista d'usuaris inscrits a un esdeveniment.
   * @param eventId ID de l'esdeveniment.
   * @returns Observable amb l'array d'usuaris inscrits.
   */
  getEventUsers(eventId: number): Observable<EventUser[]> {
    const params = new HttpParams()
      .set('action', 'event_users')
      .set('id', eventId.toString()); // L'API utilitza 'id' per a event_id aquí
    return this.http.get<EventUser[]>(this.apiUrl, { params });
  }

}
