import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'; // Afegit tap per a logging si cal

// Importa les interfícies des del fitxer de models
// *** ASSEGURA'T QUE LA RUTA ÉS CORRECTA PER AL TEU PROJECTE ***
import { StoryUserData, StorySlide } from './../../models/stories.model'; // La teva ruta d'importació

import { environment } from '../../../../environments/environment';

/**
 * Defineix l'estructura esperada de la resposta per a les accions de votar/desvotar.
 */
export interface VoteResponse {
  message: string;
  newVoteCount?: number; // El recompte actualitzat de vots (opcional, depèn de l'API)
  // Pots afegir altres camps si l'API els retorna (p.ex., success: boolean)
}


@Injectable({
  providedIn: 'root'
})
export class StoriesService {
  // URL base de l'API de stories definida al teu script PHP
  private apiUrl = environment.apiUrl + '/stories_api.php'; // Comprova el nom del fitxer PHP

  // Injecta HttpClient per fer peticions HTTP
  constructor(private http: HttpClient) { }

  /**
   * Obté la llista d'usuaris amb stories actives per mostrar a la barra superior.
   * Fa una crida a l'acció 'getUsersWithActiveStories' de l'API.
   * @returns Un Observable que emet un array d'objectes StoryUserData.
   */
  getStoriesForBar(): Observable<StoryUserData[]> {
    const params = new HttpParams().set('action', 'getUsersWithActiveStories');

    // Fa la petició GET, especificant el tipus de resposta esperat: StoryUserData[]
    return this.http.get<StoryUserData[]>(this.apiUrl, { params }).pipe(
      // tap(data => console.log('Dades rebudes per a la barra (tipades):', data)), // Logging amb 'tap' (opcional)
      catchError(this.handleError) // Gestiona possibles errors
    );
  }

  /**
   * Obté els detalls (slides) de les stories actives per a un usuari específic.
   * NOTA: Aquesta funció de l'API PHP retorna només les slides, no l'objecte StoryUserData complet.
   * @param userId L'ID de l'usuari del qual es volen obtenir les stories.
   * @returns Un Observable que emet un array d'objectes StorySlide.
   */
  getStoryDetails(userId: number): Observable<StorySlide[]> {
    const params = new HttpParams()
      .set('action', 'getStoryDetailsForUser')
      .set('user_id', userId.toString());

    // Fa la petició GET, especificant el tipus de resposta esperat: StorySlide[]
    return this.http.get<StorySlide[]>(this.apiUrl, { params }).pipe(
      // tap(data => console.log(`Slides rebudes per a l'usuari ${userId} (tipades):`, data)), // Logging (opcional)
      catchError(this.handleError) // Gestiona possibles errors
    );
  }

  /**
   * Vota una història específica.
   * Fa una crida POST a l'acció 'voteStory'.
   * @param storyId L'ID de la història (slide) a votar.
   * @param userId L'ID de l'usuari que realitza el vot (necessari per a la taula drink_story_votes).
   * @returns Un Observable amb la resposta tipada de l'API (VoteResponse).
   */
  voteStory(storyId: number, userId: number): Observable<VoteResponse> {
    // Es passen les dades com a cos de la petició POST (més estàndard que en params per a POST)
    // L'API PHP haurà de llegir des de $_POST o php://input
    const body = {
      action: 'voteStory',
      story_id: storyId,
      user_id: userId
    };
    // Alternativament, si l'API PHP llegeix només de _GET/_POST per l'action i la resta del body:
    // const params = new HttpParams().set('action', 'voteStory');
    // const body = { story_id: storyId, user_id: userId };
    // return this.http.post<VoteResponse>(this.apiUrl, body, { params }).pipe(catchError(this.handleError));

    // Utilitzant HttpParams com ho tenies (funciona si PHP llegeix _POST['action'], etc.)
     const params = new HttpParams()
        .set('action', 'voteStory')
        .set('story_id', storyId.toString())
        .set('user_id', userId.toString());
     // Important: Normalment s'envia el body buit o amb les dades, però si l'API
     // llegeix de $_POST usant HttpParams al body, pot funcionar.
     // Però és més correcte enviar les dades al body per a POST.
     // Provem enviant un body buit si l'API llegeix de $_POST.
     return this.http.post<VoteResponse>(this.apiUrl, params).pipe( // S'envien els params al body, PHP els llegirà de $_POST
       catchError(this.handleError)
     );
  }

  /**
   * Elimina el vot d'una història específica.
   * Fa una crida POST (o podria ser DELETE) a l'acció 'unvoteStory'.
   * @param storyId L'ID de la història (slide) a desvotar.
   * @param userId L'ID de l'usuari que elimina el vot.
   * @returns Un Observable amb la resposta tipada de l'API (VoteResponse).
   */
  unvoteStory(storyId: number, userId: number): Observable<VoteResponse> {
     // Similar a voteStory, s'envien les dades via POST
     const params = new HttpParams()
        .set('action', 'unvoteStory')
        .set('story_id', storyId.toString())
        .set('user_id', userId.toString());

     return this.http.post<VoteResponse>(this.apiUrl, params).pipe( // S'envien els params al body, PHP els llegirà de $_POST
       catchError(this.handleError)
     );
  }


  /**
   * Mètode privat per gestionar errors de les peticions HTTP.
   * @param error L'objecte HttpErrorResponse rebut.
   * @returns Un Observable que emet un error per ser capturat pel component.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconegut!';
    let userFriendlyMessage = 'Alguna cosa ha anat malament; si us plau, intenta-ho de nou més tard.';

    if (error.error instanceof ErrorEvent) {
      // Error del costat del client o de xarxa
      errorMessage = `Error del client: ${error.error.message}`;
    } else {
      // El backend ha retornat un codi d'error
      errorMessage = `Error del servidor (codi ${error.status}): ${error.message}`;
      // Intenta obtenir un missatge més específic del cos de l'error (enviat per PHP)
      if (error.error && typeof error.error === 'object' && error.error.message) {
           errorMessage += `\nDetall Backend: ${error.error.message}`;
           // Podries usar aquest missatge més específic per a l'usuari si és adequat
           // userFriendlyMessage = error.error.message;
      } else if (typeof error.error === 'string') {
           errorMessage += `\nCos Error: ${error.error}`; // Si el backend retorna un string simple
      }
       console.error("Detalls complets de l'error del backend:", error); // Log complet
    }

    console.error(errorMessage); // Log de l'error processat a la consola

    // Retorna un observable que falla amb un missatge per a l'usuari.
    // El component pot accedir a `error.message` per obtenir aquest text.
    return throwError(() => new Error(userFriendlyMessage + (error.error?.message ? ` (${error.error.message})` : '') ));
  }

}
