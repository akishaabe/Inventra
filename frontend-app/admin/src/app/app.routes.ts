import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login }from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { Forecasting } from './pages/forecasting/forecasting';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'dashboard', component: Dashboard },
  { path: 'inventory', component: Inventory },
  { path: 'forecasting', component: Forecasting },
  { path: 'settings', component: Settings },
  { path: '**', redirectTo: '' }
];
