import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { Forecasting } from './pages/forecasting/forecasting';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Twofa } from './pages/twofa/twofa';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'signup', component: Signup },
  { path: '2fa', component: Twofa },
  { path: 'dashboard', component: Dashboard },
  { path: 'inventory', component: Inventory },
  { path: 'forecasting', component: Forecasting },
  { path: 'reports', component: Reports },
  { path: 'settings', component: Settings },
  { path: '**', redirectTo: 'home' }
];
