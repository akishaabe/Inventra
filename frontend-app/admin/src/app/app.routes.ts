import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { Dashboard} from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { Forecasting } from './pages/forecasting/forecasting';
import { Settings } from './pages/settings/settings';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: Dashboard },
  { path: 'inventory', component: Inventory },
  { path: 'forecasting', component: Forecasting },
  { path: 'settings', component: Settings },
  { path: '**', redirectTo: '' }

];
