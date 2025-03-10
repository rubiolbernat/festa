import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard], // <-- DESCOMENTA AIXÒ
    data: { roles: ['admin', 'viewer'] }
  },
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    // canActivate: [AuthGuard],
    // data: { roles: ['admin', 'viewer'] } // Només permet accés a admins
  },
  {
    path: '',
    loadChildren: () => import('./landing/landing.routes').then(m => m.LANDING_ROUTES),
    pathMatch: 'prefix'
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
