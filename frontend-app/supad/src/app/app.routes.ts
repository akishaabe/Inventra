import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { Forecasting } from './pages/forecasting/forecasting';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';
import { Login } from './pages/login/login';
import { TwoFA } from './pages/twofa/twofa';
import { ForgotPassword } from './pages/forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'twofa', component: TwoFA },
  { path: 'dashboard', component: Dashboard },
  { path: 'inventory', component: Inventory },
  { path: 'forecasting', component: Forecasting },
  { path: 'reports', component: Reports },
  { path: 'settings', component: Settings },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'verify-code',    loadComponent: () => import('./pages/verify-code/verify-code').then(m => m.VerifyCode) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password').then((m) => m.ResetPassword)},
  { path: '**', redirectTo: 'home' }
];
