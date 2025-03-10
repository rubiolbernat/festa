import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AlertService } from '../services/alert/alert.service';
import { OverlayService } from '../services/overlay/overlay.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private alertService: AlertService, private overlayService: OverlayService) {  }
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log("AuthGuard: Executant canActivate");

    const user = this.authService.getUser();
    console.log("AuthGuard: Usuari:", user);

    if (!user) {
      console.log("AuthGuard: Usuari no loguejat, redirigint a /login");
      this.alertService.showAlert('Usuari no logejat', 'warning', 3000);
      this.overlayService.open('login-overlay');
      this.router.navigate(['/home'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRoles: string[] = route.data['roles'];
    console.log("AuthGuard: Rols requerits:", requiredRoles);
    console.log("AuthGuard: Rols de l'usuari:", user.roles);

    if (requiredRoles && !user.roles.some(role => requiredRoles.includes(role))) {
      console.log("AuthGuard: Usuari no té els rols necessaris, redirigint a /forbidden");
      this.alertService.showAlert('Usuari no té els rols necessaris"', 'warning', 3000);
      this.router.navigate(['/home']);
      return false;
    }

    console.log("AuthGuard: Usuari autoritzat");
    return true;
  }
}
