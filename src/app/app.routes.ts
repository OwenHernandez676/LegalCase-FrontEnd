import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

/**
 * Enrutamiento raíz con lazy loading.
 * - Zona pública: landing + login.
 * - Zona privada (/app): protegida por authGuard, con layout de aplicación
 *   y sub-rutas perezosas protegidas por roleGuard donde corresponde.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('@features/landing/landing.page').then((m) => m.LandingPage) },
      { path: 'login', loadComponent: () => import('@features/auth/login.page').then((m) => m.LoginPage) },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('@features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'requests', canActivate: [roleGuard(['administrador'])], loadComponent: () => import('@features/requests/requests.page').then((m) => m.RequestsPage) },
      { path: 'cases', loadComponent: () => import('@features/cases/cases.page').then((m) => m.CasesPage) },
      { path: 'calendar', loadComponent: () => import('@features/calendar/calendar.page').then((m) => m.CalendarPage) },
      { path: 'users', canActivate: [roleGuard(['administrador'])], loadComponent: () => import('@features/users/users.page').then((m) => m.UsersPage) },
      { path: 'messages', loadComponent: () => import('@features/messages/messages.page').then((m) => m.MessagesPage) },
{ path: 'settings', loadComponent: () => import('@features/settings/settings.page').then((m) => m.SettingsPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
