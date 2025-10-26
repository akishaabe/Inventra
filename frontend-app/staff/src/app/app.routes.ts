import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'inventory', component: Inventory },
  { path: '**', redirectTo: 'dashboard' }
];
