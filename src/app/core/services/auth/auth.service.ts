import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface User {
  userId: number;
  id: number;
  name: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private httpClient = inject(HttpClient);
  private authChangesSubject = new Subject<void>();
  authChanges = this.authChangesSubject.asObservable();
  private userSubject = new BehaviorSubject<User | null>(null); // <-- AFEGEIX BehaviorSubject
  user$ = this.userSubject.asObservable(); // <-- AFEGEIX user$

  constructor() {
    this.loadUserFromLocalStorage(); // Carrega l'usuari al constructor
  }

  private loadUserFromLocalStorage() {
    const token = this.getAuthToken(); // Necessari per a la comprovació isLoggedIn
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString) as User;
        this.userSubject.next(user); // Actualitza el BehaviorSubject
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        this.userSubject.next(null);
      }
    }
    this.authChangesSubject.next(); // Emiteix sempre un valor
  }

  registerUser(user: any): Promise<any> {
    return firstValueFrom(this.httpClient.post(`${this.apiUrl}/register.php`, user));
  }

  loginUser(user: any): Promise<any> {
    return firstValueFrom(this.httpClient.post<any>(`${this.apiUrl}/login.php`, user)).then(response => {
      if (response && response.accessToken && response.refreshToken && response.user) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.userSubject.next(response.user); // Actualitza el BehaviorSubject
        this.authChangesSubject.next();
      }
      return response;
    });
  }

  refreshToken(): Promise<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return Promise.reject('No refresh token available');
    }
    return firstValueFrom(this.httpClient.post<any>(`${this.apiUrl}/refresh.php`, { refreshToken: refreshToken })).then(response => {
      if (response && response.accessToken && response.refreshToken && response.user) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.userSubject.next(response.user); // Actualitza el BehaviorSubject
        this.authChangesSubject.next();
      }
      return response;
    });
  }

  getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  getRefreshToken(): string {
    return localStorage.getItem('refreshToken') || '';
  }

  isLoggedIn(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.userSubject.next(null); // Actualitza el BehaviorSubject
    this.authChangesSubject.next();
  }

  getUser(): User | null {
    return this.userSubject.value; // Retorna el valor actual del BehaviorSubject
  }
}
