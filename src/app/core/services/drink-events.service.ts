import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DrinkEvent,
  EventUser,
  EventDetails,
  ApiResponse,
  ApiEventResponse,
  CreateEventData,
  UpdateEventData
} from '../models/drink-events.model'; // Ajusta la ruta si cal

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = environment.apiUrl; // URL base de l'API (p.ex., 'http://localhost/api/api.php')

  constructor(private http: HttpClient) { }

  /**
   * Obté tots els esdeveniments.
   * Crida: GET api.php?action=getAllEvents (o GET api.php)
   * @returns Observable amb l'array d'esdeveniments.
   */
  getAllEvents(): Observable<DrinkEvent[]> {
    const params = new HttpParams().set('action', 'getAllEvents');
    return this.http.get<DrinkEvent[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obté el pròxim esdeveniment que començarà.
   * Crida: GET api.php?action=getNextEvent
   * @returns Observable amb el pròxim esdeveniment o null si no n'hi ha.
   */
  getNextEvent(): Observable<DrinkEvent | null> {
    const params = new HttpParams().set('action', 'getNextEvent');
    // L'API retorna JSON null si no hi ha event
    return this.http.get<DrinkEvent | null>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obté els esdeveniments futurs (data fi >= ara).
   * Crida: GET api.php?action=getFutureEvents
   * @returns Observable amb l'array d'esdeveniments futurs.
   */
  getFutureEvents(): Observable<DrinkEvent[]> {
    const params = new HttpParams().set('action', 'getFutureEvents');
    return this.http.get<DrinkEvent[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obté els esdeveniments passats (data fi < ara).
   * Crida: GET api.php?action=getPastEvents
   * @returns Observable amb l'array d'esdeveniments passats.
   */
  getPastEvents(): Observable<DrinkEvent[]> {
    const params = new HttpParams().set('action', 'getPastEvents');
    return this.http.get<DrinkEvent[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obté els esdeveniments actius en una data específica.
   * Crida: GET api.php?action=getEventsByDate&date=YYYY-MM-DD
   * @param date Data en format 'YYYY-MM-DD'.
   * @returns Observable amb l'array d'esdeveniments.
   */
  getEventsByDate(date: string): Observable<DrinkEvent[]> {
    const params = new HttpParams()
      .set('action', 'getEventsByDate')
      .set('date', date);
    return this.http.get<DrinkEvent[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obté els detalls complets d'un esdeveniment, incloent els participants.
   * Crida: GET api.php?action=getEventDetails&event_id={eventId}
   * @param eventId ID de l'esdeveniment.
   * @returns Observable amb els detalls de l'esdeveniment.
   */
  getEventDetails(eventId: number): Observable<EventDetails> {
    const params = new HttpParams()
      .set('action', 'getEventDetails')
      .set('event_id', eventId.toString());
    return this.http.get<EventDetails>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crea un nou esdeveniment.
   * Crida: POST api.php?action=addEvent (amb dades JSON al body)
   * @param eventData Dades del nou esdeveniment.
   * @returns Observable amb la resposta (missatge i l'event creat).
   */
  createEvent(eventData: CreateEventData): Observable<ApiEventResponse> {
    const params = new HttpParams().set('action', 'addEvent');
    return this.http.post<ApiEventResponse>(this.apiUrl, eventData, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualitza un esdeveniment existent.
   * Crida: PUT api.php?action=updateEvent&event_id={eventId} (amb dades JSON al body)
   * @param eventId ID de l'esdeveniment a actualitzar.
   * @param eventData Dades a actualitzar. L'API PHP espera tots els camps.
   * @returns Observable amb la resposta (missatge i l'event actualitzat).
   */
  updateEvent(eventId: number, eventData: UpdateEventData): Observable<ApiEventResponse> {
    const params = new HttpParams()
      .set('action', 'updateEvent')
      .set('event_id', eventId.toString());
    return this.http.put<ApiEventResponse>(this.apiUrl, eventData, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Elimina un esdeveniment.
   * Crida: DELETE api.php?action=deleteEvent&event_id={eventId}
   * @param eventId ID de l'esdeveniment a eliminar.
   * @returns Observable<void> (per gestionar el 204 No Content).
   */
  deleteEvent(eventId: number): Observable<void> {
    const params = new HttpParams()
      .set('action', 'deleteEvent')
      .set('event_id', eventId.toString());
    // Esperem un 204 No Content en cas d'èxit, que no té body.
    // HttpClient per defecte espera JSON, així que indiquem responseType='text'
    // o simplement ignorem el body i confiem en l'status code.
    // L'opció més simple és esperar 'void' i deixar que http status > 400 sigui error.
    return this.http.delete<void>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Inscriu l'usuari autenticat a un esdeveniment.
   * Crida: POST api.php?action=signUp&event_id={eventId} (user_id s'obté al backend)
   * @param eventId ID de l'esdeveniment.
   * @returns Observable amb la resposta de l'API (missatge).
   */
  signUp(eventId: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('action', 'signUp')
      .set('event_id', eventId.toString());
    // No enviem body, user_id es gestiona al backend
    return this.http.post<ApiResponse>(this.apiUrl, null, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Desinscriu l'usuari autenticat d'un esdeveniment.
   * Crida: POST api.php?action=unsign&event_id={eventId} (user_id s'obté al backend)
   * ATENCIÓ: L'API PHP utilitza POST per 'unsign', però la funció retorna 204 (com un DELETE).
   * El servei segueix l'estructura del router (POST).
   * @param eventId ID de l'esdeveniment.
   * @returns Observable amb la resposta de l'API (missatge en cas d'error 404, o void/empty en èxit 204).
   */
    unsign(eventId: number): Observable<ApiResponse | void> { // Permetem void per al 204
      const params = new HttpParams()
          .set('action', 'unsign')
          .set('event_id', eventId.toString());
      // Observem la resposta completa per poder gestionar el 204
      return this.http.post(this.apiUrl, null, { params, observe: 'response', responseType: 'json' }) // responseType json per llegir errors 404
          .pipe(
              map(response => {
                  if (response.status === 204) {
                      return undefined; // Retorna undefined (equivalent a void) per al 204
                  }
                  // Si no és 204, intenta retornar el body (per errors 404 amb missatge)
                  return response.body as ApiResponse;
              }),
              catchError(this.handleError)
          );
  }


  // Gestor d'errors privat
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'Error desconegut del servidor';

    // Intenta obtenir el missatge d'error del cos de la resposta de l'API
    if (error.error && error.error.message) {
      errorMessage = `API Error: ${error.error.message}`;
    } else if (error.message) {
      errorMessage = `Client/Network Error: ${error.message}`;
    } else if (error.status) {
       errorMessage = `Error ${error.status}: ${error.statusText}`;
    }

    // Retorna un observable amb l'error per a que el component el pugui gestionar
    return throwError(() => new Error(errorMessage));
  }
}
