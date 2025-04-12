import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserSimplified } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserFollowService {
  private apiUrl = environment.apiUrl+`v2/user-follow.php`;

  constructor(private http: HttpClient) {}

  /** Seguir un usuari */
  followUser(followerId: number, followedId: number): Observable<any> {
    const body = new FormData();
    body.append('action', 'followUser');
    body.append('follower_id', followerId.toString());
    body.append('followed_id', followedId.toString());

    return this.http.post(this.apiUrl, body).pipe(
      catchError(this.handleError)
    );
  }

  /** Deixar de seguir un usuari */
  unfollowUser(followerId: number, followedId: number): Observable<any> {
    const body = new FormData();
    body.append('action', 'unfollowUser');
    body.append('follower_id', followerId.toString());
    body.append('followed_id', followedId.toString());

    return this.http.post(this.apiUrl, body).pipe(
      catchError(this.handleError)
    );
  }

  /** Llista de seguidors (retorna UserSimplified) */
  getFollowers(userId: number): Observable<UserSimplified[]> {
    const params = new HttpParams()
      .set('action', 'getFollowers')
      .set('user_id', userId.toString());

    return this.http.get<UserSimplified[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /** Suggeriments d'usuaris per seguir (UserSimplified) */
  getSuggestions(userId: number): Observable<UserSimplified[]> {
    const params = new HttpParams()
      .set('action', 'getSuggestions')
      .set('user_id', userId.toString());

    return this.http.get<UserSimplified[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /** Funció per gestionar errors */
  private handleError(error: any) {
    console.error('Error en la crida HTTP:', error);
    return throwError(() => new Error('Hi ha hagut un problema amb el servidor.'));
  }
}
