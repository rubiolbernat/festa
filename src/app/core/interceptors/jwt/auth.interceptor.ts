import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { from, catchError, switchMap, throwError, Observable } from 'rxjs'; // Importa 'from' i 'Observable'

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.getAuthToken();

  const authReq = req.clone({
    setHeaders: {
      Authorization: token
    }
  });

  return next(authReq).pipe(
    catchError((err: any) => { // Important: Tipa 'err' com a 'any'
      // Converteix la Promise en un Observable utilitzant 'from'
      return from(authService.refreshToken()).pipe(
        switchMap((res: any) => { // Important: Tipa 'res' com a 'any'
          // Guarda el nou token
          if (res && res.accessToken) { // Important: Comprova que 'res' i 'res.accessToken' existeixen
            localStorage.setItem('token', res.accessToken);

            const newReq = req.clone({
              setHeaders: {
                Authorization: res.accessToken
              }
            });

            return next(newReq);
          } else {
            // Si no hi ha access token, llança un error
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return throwError(() => 'No access token available after refresh');
          }
        }),
        catchError((refreshErr: any) => { // Important: Tipa 'refreshErr' com a 'any'
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          return throwError(() => refreshErr); // Llança l'error original
        })
      );
    })
  );
};
