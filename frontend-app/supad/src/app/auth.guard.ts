import { CanActivateFn } from '@angular/router';
import { environment } from '../environments/environment';

export const superadminGuard: CanActivateFn = () => {
  const getCookie = (name: string) =>
    document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];

  try {
    // 1) Allow bootstrap via URL params from 2FA redirect as fallback
    const params = new URLSearchParams(window.location.search);
    const e = params.get('e');
    const r = params.get('r');
    if (e && r) {
      const roleNorm = r.toString().trim().toUpperCase();
      const payload = { email: e, role: roleNorm } as any;
      localStorage.setItem('user', JSON.stringify(payload));
      // Set cookie for cross-app continuity
      const ckPayload = encodeURIComponent(JSON.stringify(payload));
      document.cookie = `inventra_user=${ckPayload}; Max-Age=900; Path=/; SameSite=Lax`;
      // Clean URL
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }

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
      const role = (user?.role || '').toString().trim().toUpperCase();
      if (role === 'SUPERADMIN') return true;
    }
  } catch {}

  window.location.href = environment.sharedBase + '/login';
  return false;
};
