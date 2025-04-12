import { Routes } from "@angular/router";
import { LandingLayoutComponent } from '../layout/landing-layout/landing-layout.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthGuard } from '../core/guards/auth.guard'; // Importem el guard
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
        path: 'home',
        component: HomePageComponent
      },
      {
        path: 'login',
        loadComponent: () => import('./login-page/login-page.component').then(m => m.LoginPageComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./login-register-page/login-register-page.component').then(m => m.LoginRegisterPageComponent)
      },
      {
        path: 'forgotpassword',
        loadComponent: () => import('./login-forgotpassword-page/login-forgotpassword-page.component').then(m => m.LoginForgotpasswordPageComponent)
      },
      {
        path: 'legal',
        loadComponent: () => import('./legal-page/legal-page.component').then(m => m.LegalPageComponent)
      },
      //JOCS
      {
        path: 'jocs',
        loadComponent: () => import('./games/games-menu-page/games-menu-page.component').then(m => m.GamesMenuPageComponent),
      },
      {
        path: 'jo_maimai',
        loadComponent: () => import('./games/maimai-page/maimai-page.component').then(m => m.MaimaiPageComponent)
      },
      {
        path: 'veritatoprova',
        loadComponent: () => import('./games/trhuthdare-page/trhuthdare-page.component').then(m => m.TrhuthdarePageComponent)
      },
      {
        path: 'la_gran_aventura',
        loadComponent: () => import('./drinking-image-page/drinking-page.component').then(m => m.DrinkingPageComponent),

        canActivate: [AuthGuard], //Només accessible si estàs loguejat
      },
      {
        path: 'la_gran_aventura_v2',
        loadComponent: () => import('./drinking-page/drinking-page.component').then(m => m.DrinkingPageComponent),
        canActivate: [AuthGuard], //Només accessible si estàs loguejat
        data: { roles: ['admin', 'editor'] }
      }, {
        path: 'la_gran_aventura-list',
        loadComponent: () => import('./drink-data-list-page/drink-data-list-page.component').then(m => m.DrinkDataListPageComponent),
        canActivate: [AuthGuard], //Només accessible si estàs loguejat
      }, {
        path: 'la_gran_aventura-edit/:id',
        loadComponent: () => import('./drink-data-edit-page/drink-data-edit-page.component').then(m => m.DrinkDataEditPageComponent),
        canActivate: [AuthGuard], //Només accessible si estàs loguejat
      }, {
        path: 'la_gran_aventura-stats',
        loadComponent: () => import('./stats-page/stats-page.component').then(m => m.StatsPageComponent),
        canActivate: [AuthGuard],
      }, {
        path: 'ruleta',
        loadComponent: () => import('./wheel-page/wheel-page.component').then(m => m.WheelPageComponent),
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
