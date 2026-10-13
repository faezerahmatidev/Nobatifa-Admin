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
    path: '',
    component: AdminShell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
        title: 'نوبتیفا | داشبورد',
      },
    ],
  },
];
