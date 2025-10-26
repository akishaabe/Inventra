import { CanActivateFn } from '@angular/router';
import { environment } from '../environments/environment';

export const adminGuard: CanActivateFn = (route, state) => {
  // Helper to read cookie value by name
  const getCookie = (name: string) =>
    document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];

  try {
    let raw = localStorage.getItem('user');
    if (!raw) {
      const ck = getCookie('inventra_user');
      if (ck) {
        try {
          const parsed = JSON.parse(decodeURIComponent(ck));
          if (parsed?.email && parsed?.role) {
            localStorage.setItem('user', JSON.stringify(parsed));
            raw = JSON.stringify(parsed);
          }
        } catch {}
      }
    }

    if (raw) {
      const user = JSON.parse(raw);
      const role = (user?.role || '').toUpperCase();
      if (role === 'ADMIN') return true;
    }
  } catch {}

  // Not authorized -> go to shared login
  window.location.href = environment.sharedBase + '/login';
  return false;
};
