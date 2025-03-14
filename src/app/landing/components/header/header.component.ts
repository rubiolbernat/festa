import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { RouterLinkActive, RouterModule, Router } from '@angular/router';
import { CartStateService } from '../../../core/services/CartState/cart-state.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

declare var bootstrap: any; // Afegeix aquesta línia per evitar errors amb Bootstrap

interface User {
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
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  cartState = inject(CartStateService).state;
  authService = inject(AuthService);
  router = inject(Router);
  private elementRef = inject(ElementRef);

  isLoggedIn: boolean = false;
  userName: string | null = null;
  private authSubscription: Subscription | undefined;
  user: User | null = null;
  isAdminOrVendor: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.updateHeader();
    this.authSubscription = this.authService.authChanges.subscribe(() => {
      this.updateHeader();
    });
  }

  ngAfterViewInit(): void {
    const offcanvasNavbar = this.elementRef.nativeElement.querySelector('#offcanvasNavbar');
    const offcanvasLinks = [
      ...offcanvasNavbar?.querySelectorAll('.nav-link'),
      ...offcanvasNavbar?.querySelectorAll('.button-link')
    ];

    if (offcanvasLinks.length > 0) {
      offcanvasLinks.forEach((link: HTMLElement) => {
        link.addEventListener('click', () => {
          const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasNavbar);
          if (offcanvas) {
            offcanvas.hide();
          }
        });
      });
    }
  }


  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  openOverlay(name: string) {
    //this.overlayService.open(name);
  }

  logout() {
    this.authService.logout();
    this.updateHeader();
    this.router.navigate(['/home']);
  }

  private updateHeader(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.user = this.authService.getUser();
    this.userName = this.user ? this.user.name : 'Usuari';
    this.isAdminOrVendor = this.checkIfAdminOrVendor();
  }

  private checkIfAdminOrVendor(): boolean {
    const user = this.authService.getUser();
    return user ? (user.roles.includes('admin') || user.roles.includes('vendor')) : false;
  }
}
