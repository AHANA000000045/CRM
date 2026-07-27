import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/metrics/metrics.component').then((m) => m.MetricsComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users-list/users-list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'leads',
        loadComponent: () => import('./features/leads/leads-list/leads-list.component').then((m) => m.LeadsListComponent),
      },
      {
        path: 'deals',
        loadComponent: () => import('./features/deals/deals-kanban/deals-kanban.component').then((m) => m.DealsKanbanComponent),
      },
      {
        path: 'organizations',
        loadComponent: () => import('./features/organizations/organizations.component').then((m) => m.OrganizationsComponent),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/tasks.component').then((m) => m.TasksComponent),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
