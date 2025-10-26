import { Routes } from '@angular/router';
import { superadminGuard } from './auth.guard';

import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { Forecasting } from './pages/forecasting/forecasting';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [superadminGuard] },
  { path: 'inventory', component: Inventory, canActivate: [superadminGuard] },
  { path: 'forecasting', component: Forecasting, canActivate: [superadminGuard] },
  { path: 'reports', component: Reports, canActivate: [superadminGuard] },
  { path: 'settings', component: Settings, canActivate: [superadminGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
