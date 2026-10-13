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
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointments-page').then((m) => m.AppointmentsPage),
        title: 'نوبتیفا | نوبت‌ها',
      },
      {
        path: 'time',
        loadComponent: () => import('./features/time/time-page').then((m) => m.TimePage),
        title: 'نوبتیفا | مدیریت زمان',
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services-page').then((m) => m.ServicesPage),
        title: 'نوبتیفا | مدیریت خدمات',
      },
      {
        path: 'factors',
        loadComponent: () =>
          import('./features/factors/factors-page').then((m) => m.FactorsPage),
        title: 'نوبتیفا | فاکتورها',
      },
      {
        path: 'factors/:id',
        loadComponent: () =>
          import('./features/factors/factor-detail-page').then((m) => m.FactorDetailPage),
        title: 'نوبتیفا | فاکتور',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile-page').then((m) => m.ProfilePage),
        title: 'نوبتیفا | پروفایل',
      },
    ],
  },
];
