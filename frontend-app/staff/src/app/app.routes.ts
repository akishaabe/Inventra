import { Routes } from '@angular/router';
import { staffGuard } from './auth.guard';

import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [staffGuard] },
  { path: 'inventory', component: Inventory, canActivate: [staffGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
