import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
    { path: 'inventory', component: Inventory },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
