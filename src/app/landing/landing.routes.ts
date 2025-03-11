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
        path: 'home',
        component: HomePageComponent
      },
      {
        path: 'legal',
        loadComponent: () => import('./legal-page/legal-page.component').then(m => m.LegalPageComponent)
      },
      //JOCS
      {
        path: '',
        loadComponent: () => import('./games-menu-page/games-menu-page.component').then(m => m.GamesMenuPageComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'jo_maimai',
        loadComponent: () => import('./maimai-page/maimai-page.component').then(m => m.MaimaiPageComponent)
      },{
        path: 'la_gran_aventura',
        loadComponent: () => import('./drinking-page/drinking-page.component').then(m => m.DrinkingPageComponent),
        canActivate: [AuthGuard], //Només accessible si estàs loguejat
      },{
        path: 'la_gran_aventura-list',
        loadComponent: () => import('./drink-data-list-page/drink-data-list-page.component').then(m => m.DrinkDataListPageComponent),
        canActivate: [AuthGuard], //Només accessible si estàs loguejat
      },{
        path: 'la_gran_aventura-edit/:id',
        loadComponent: () => import('./drink-data-edit-page/drink-data-edit-page.component').then(m => m.DrinkDataEditPageComponent),
        canActivate: [AuthGuard], //Només accessible si estàs loguejat
      },{
        path: 'la_gran_aventura-stats',
        loadComponent: () => import('./stats-page/stats-page.component').then(m => m.StatsPageComponent),
        canActivate: [AuthGuard],
      }
    ]
  },
  { path: '**', redirectTo: 'beure' }
];
