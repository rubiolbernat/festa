import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLinkActive, RouterModule, Router } from '@angular/router'; // <-- AFEGEIX Router
import { CartStateService } from '../../../core/services/CartState/cart-state.service';
import { OverlayService } from '../../../core/services/overlay/overlay.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

interface User { // Defineix la interfície User (si vols mostrar info al header)
  userId: number;
  name: string;
  roles: string[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, RouterLinkActive, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartState = inject(CartStateService).state;
  authService = inject(AuthService);
  router = inject(Router); // <-- AFEGEIX Router
  isLoggedIn: boolean = false;
  userName: string | null = null;
  private authSubscription: Subscription | undefined;
  user: User | null = null; // Emmagatzema la info de l'usuari aquí
  isAdminOrVendor: boolean = false; // <-- AFEGEIX AQUESTA LÍNIA

  constructor(private overlayService: OverlayService) { }

  ngOnInit(): void {
    this.updateHeader();

    this.authSubscription = this.authService.authChanges.subscribe(() => {
      this.updateHeader();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  openOverlay(name: string) {
    this.overlayService.open(name);
  }

  logout() {
    this.authService.logout();
    this.updateHeader();
    this.router.navigate(['/']); // <-- AFEGEIX AQUESTA LÍNIA
  }

  private updateHeader(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.user = this.authService.getUser(); // Obtenim la info de l'usuari del AuthService
    this.userName = this.user ? this.user.name : 'Usuari'; // Mostra el nom si existeix
    this.isAdminOrVendor = this.checkIfAdminOrVendor(); // <-- AFEGEIX AQUESTA LÍNIA
  }

  checkIfAdminOrVendor(): boolean { // <-- AFEGEIX AQUESTA FUNCIÓ
    const user = this.authService.getUser();
    return user ? (user.roles.includes('admin') || user.roles.includes('vendor')) : false;
  }
}
