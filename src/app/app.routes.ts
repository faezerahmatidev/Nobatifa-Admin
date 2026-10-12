import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { AdminShell } from './core/shell/admin-shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage),
    title: 'نوبتیفا | ورود مدیریت',
  },
  {
    // Feature children land in Phase 6; the guarded shell already works.
    path: '',
    component: AdminShell,
    canActivate: [authGuard],
    children: [],
  },
];
