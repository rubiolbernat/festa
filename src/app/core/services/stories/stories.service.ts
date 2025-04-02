import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { StoryUserData, StorySlide } from './../../models/stories.model'; // Ajusta la ruta si cal
import { environment } from '../../../../environments/environment';

// ... (les interfícies VoteResponse i DeleteResponse romanen igual) ...
export interface VoteResponse {
  message: string;
  newVoteCount?: number;
}
export interface DeleteResponse {
  message: string;
  deletedCount?: number;
}


@Injectable({
  providedIn: 'root'
})
export class StoriesService {
  private apiUrl = environment.apiUrl + '/stories_api.php';

  // Injecta HttpClient. NO cridis deleteExpiredStories aquí.
  constructor(private http: HttpClient) { }

  // ... (getStoriesForBar, getStoryDetails, voteStory, unvoteStory romanen igual) ...
   getStoriesForBar(): Observable<any[]> {
    const params = new HttpParams().set('action', 'getUsersWithActiveStories');
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getStoryDetails(userId: number): Observable<StorySlide[]> {
    const params = new HttpParams()
      .set('action', 'getStoryDetailsForUser')
      .set('user_id', userId.toString());
    return this.http.get<StorySlide[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  voteStory(storyId: number, userId: number): Observable<VoteResponse> {
     const params = new HttpParams()
        .set('action', 'voteStory')
        .set('story_id', storyId.toString())
        .set('user_id', userId.toString());
     return this.http.post<VoteResponse>(this.apiUrl, params).pipe(
       catchError(this.handleError)
     );
  }

  unvoteStory(storyId: number, userId: number): Observable<VoteResponse> {
     const params = new HttpParams()
        .set('action', 'unvoteStory')
        .set('story_id', storyId.toString())
        .set('user_id', userId.toString());
     return this.http.post<VoteResponse>(this.apiUrl, params).pipe(
       catchError(this.handleError)
     );
  }


  /**
   * *** MÈTODE MODIFICAT ***
   * Crida a l'API per eliminar les stories més antigues que les hores especificades
   * (excepte les guardades).
   * @param maxAgeHours El nombre màxim d'hores d'antiguitat permeses per a una story.
   * @returns Un Observable amb la resposta tipada DeleteResponse.
   */
  deleteExpiredStories(maxAgeHours: number): Observable<DeleteResponse> {
    // Creem els paràmetres per enviar al body de la petició POST
    const params = new HttpParams()
        .set('action', 'deleteExpiredStories')
        // Afegim el nou paràmetre amb les hores
        .set('max_age_hours', maxAgeHours.toString());

    // Fem la petició POST, enviant els paràmetres al body
    return this.http.post<DeleteResponse>(this.apiUrl, params).pipe(
      tap(response => {
          if (response.deletedCount && response.deletedCount > 0) {
            console.log(`Stories més antigues de ${maxAgeHours} hores eliminades: ${response.deletedCount}`);
          } else {
            console.log(`No s'han trobat stories per eliminar amb antiguitat superior a ${maxAgeHours} hores.`);
          }
      }),
      catchError(this.handleError) // Gestionem errors
    );
  }


  /**
   * Mètode privat per gestionar errors HTTP.
   */
  private handleError(error: HttpErrorResponse) {
    // ... (El teu gestor d'errors handleError roman igual) ...
     let errorMessage = 'Error desconegut!';
     let userFriendlyMessage = 'Alguna cosa ha anat malament; si us plau, intenta-ho de nou més tard.';

     if (error.error instanceof ErrorEvent) {
       errorMessage = `Error del client: ${error.error.message}`;
     } else {
       errorMessage = `Error del servidor (codi ${error.status}): ${error.message}`;
        if (error.error && typeof error.error === 'object' && error.error.message) {
            errorMessage += `\nDetall Backend: ${error.error.message}`;
            userFriendlyMessage = error.error.message;
        } else if (typeof error.error === 'string') {
            errorMessage += `\nCos Error: ${error.error}`;
        }
         console.error("Detalls complets de l'error:", error);
     }
     console.error("Error processat:",errorMessage);
     return throwError(() => new Error(userFriendlyMessage));
  }

}
