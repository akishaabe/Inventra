import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-twofa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './twofa.html',
  styleUrls: ['./twofa.css']
})
export class TwoFA implements OnInit, OnDestroy {
  code: string[] = ['', '', '', '', '', ''];
  codeDigits = Array(6).fill(0);
  error = '';
  loading = false;
  timer = 30;
  canResend = false;
  interval: any;
  email: string = '';
  maskedEmail: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('twofaEmail') || '';
    if (!this.email) {
      this.router.navigate(['/login']);
      return;
    }

    this.maskedEmail = this.maskEmail(this.email);
    this.startTimer();

    // Auto-focus first input box
    setTimeout(() => {
      const firstInput = document.querySelector('.code-box') as HTMLInputElement;
      firstInput?.focus();
    }, 0);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    const maskedName = name[0] + '*'.repeat(Math.max(0, name.length - 2)) + name.slice(-1);
    return `${maskedName}@${domain}`;
  }

  onInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 5) {
      const next = document.querySelectorAll('.code-box')[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const prev = document.querySelectorAll('.code-box')[index - 1] as HTMLInputElement;
      prev?.focus();
    }
  }

  async onSubmit() {
    this.loading = true;
    this.error = '';

    const enteredCode = this.code.join('');

    if (!enteredCode || enteredCode.length < 6) {
      this.error = 'Please enter all 6 digits.';
      this.loading = false;
      return;
    }

    try {
  const response = await fetch(`${environment.apiBase}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, code: enteredCode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Normalize role variants (e.g., "SUPER ADMIN", "SupAd") to exact tokens
  const rawRole = (data.role || '').toString().toUpperCase();
  const compact = rawRole.replace(/[^A-Z]/g, '');
  let role: 'SUPERADMIN' | 'ADMIN' | 'STAFF' | '' = '';
  if (compact === 'SUPERADMIN' || compact === 'SUPER' || compact === 'SUPAD') {
    role = 'SUPERADMIN';
  } else if (compact === 'ADMIN' || compact === 'ADM') {
    role = 'ADMIN';
  } else if (compact === 'STAFF') {
    role = 'STAFF';
  }
  // Store minimal session info for role apps' guards
  localStorage.setItem('user', JSON.stringify({ email: this.email, role }));
  // Set a short-lived cookie for cross-subdomain handoff in production.
  // On localhost, omit Domain so it remains available across ports.
  const cookiePayload = encodeURIComponent(JSON.stringify({ email: this.email, role }));
  const isProd = environment.production;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  // Derive base domain like .cafe-inventra.com for subdomain sharing
  let domainAttr = '';
  if (isProd && !isLocal && host.split('.').length >= 2) {
    const parts = host.split('.');
    const baseDomain = `.${parts.slice(-2).join('.')}`; // e.g., .cafe-inventra.com
    domainAttr = `; Domain=${baseDomain}`;
  }
  const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `inventra_user=${cookiePayload}; Max-Age=900; Path=/; SameSite=Lax${domainAttr}${secureAttr}`;
  localStorage.removeItem('twofaEmail');

        // Redirect to corresponding frontend
        // Give the cookie a brief moment to flush before cross-port redirect
  const redirect = (url: string) => setTimeout(() => (window.location.href = url), 50);
  const qp = `?e=${encodeURIComponent(this.email)}&r=${encodeURIComponent(role)}`;

        switch (role) {
          case 'SUPERADMIN':
            redirect(`${environment.supadBase}/dashboard` + qp);
            break;
          case 'ADMIN':
            redirect(`${environment.adminBase}/dashboard` + qp);
            break;
          case 'STAFF':
            redirect(`${environment.staffBase}/dashboard` + qp);
            break;
          default:
            alert('Invalid role. Please contact support to update your user role.');
            this.router.navigate(['/login']);
        }

      } else {
        this.error = data.error || 'Invalid or expired verification code.';
      }

    } catch (err) {
      console.error('Error verifying code:', err);
      this.error = 'Failed to connect to the server.';
    } finally {
      this.loading = false;
    }
  }

  startTimer() {
    this.canResend = false;
    this.timer = 30;
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.interval);
        this.canResend = true;
      }
    }, 1000);
  }

  async resendCode() {
    if (!this.email || !this.canResend) return;
    this.loading = true;
    this.error = '';

    try {
  const response = await fetch(`${environment.apiBase}/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Verification code resent!');
        this.startTimer();
      } else {
        this.error = data.error || 'Failed to resend verification code.';
      }
    } catch (err) {
      console.error('Error resending code:', err);
      this.error = 'Failed to connect to the server.';
    } finally {
      this.loading = false;
    }
  }
}
