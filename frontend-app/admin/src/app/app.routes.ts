import { Routes } from '@angular/router';
import { adminGuard } from './auth.guard';

import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { Forecasting } from './pages/forecasting/forecasting';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [adminGuard] },
  { path: 'inventory', component: Inventory, canActivate: [adminGuard] },
  { path: 'forecasting', component: Forecasting, canActivate: [adminGuard] },
  { path: 'reports', component: Reports, canActivate: [adminGuard] },
  { path: 'settings', component: Settings, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
