import { Routes } from "@angular/router";
import { LandingLayoutComponent } from '../layout/landing-layout/landing-layout.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { AuthGuard } from '../core/guards/auth.guard'; // Importem el guard
import { CartPageComponent } from "./cart-page/cart-page.component";
//import { PersonalSpaceComponent } from './personal-space/personal-space.component'; // Importa el component correcte

export const LANDING_ROUTES: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      },
      {
        path: 'concerts',
        loadComponent: () => import('./concerts-page/concerts-page.component').then(m => m.ConcertsPageComponent)
      },
      {
        path: 'contact',
        component: ContactPageComponent
      },
      {
        path: 'cart',
        loadComponent: () => import('./cart-page/cart-page.component').then(m => m.CartPageComponent)
      },
      {
        path: 'legal',
        loadComponent: () => import('./legal-page/legal-page.component').then(m => m.LegalPageComponent)
      },
      {
        path: 'personal-space', // RUTA PROTEGIDA
        component: CartPageComponent, // <-- CANVIA AIXÒ: Importa i utilitza el component correcte
        canActivate: [AuthGuard] // Aquí protegim la ruta
      },
      //JOCS
      {
        path: 'jocs',
        loadComponent: () => import('./games-menu-page/games-menu-page.component').then(m => m.GamesMenuPageComponent)
      },
      {
        path: 'jo_maimai',
        loadComponent: () => import('./games-menu-page/maimai-page/maimai-page.component').then(m => m.MaimaiPageComponent)
      },{
        path: 'la_gran_aventura',
        loadComponent: () => import('./games-menu-page/drinking-page/drinking-page.component').then(m => m.DrinkingPageComponent),
        canActivate: [AuthGuard], //Només accessible si estàs loguejat
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
