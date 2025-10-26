import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { TwoFA } from './pages/twofa/twofa';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { VerifyCode } from './pages/verify-code/verify-code';
import { ResetPassword } from './pages/reset-password/reset-password';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'twofa', component: TwoFA },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'verify-code', component: VerifyCode },
  { path: 'reset-password', component: ResetPassword },
  { path: '**', redirectTo: '' }
];