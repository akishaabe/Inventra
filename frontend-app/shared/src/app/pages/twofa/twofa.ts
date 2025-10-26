import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
      const response = await fetch('http://localhost:4000/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, code: enteredCode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // we receive role from backend
  const role = (data.role || '').toUpperCase();
  // Store minimal session info for role apps' guards
  localStorage.setItem('user', JSON.stringify({ email: this.email, role }));
  // Set a short-lived cookie shared across ports on localhost for cross-app handoff
  // Note: cookies are shared by domain (localhost) across ports.
  const cookiePayload = encodeURIComponent(JSON.stringify({ email: this.email, role }));
  document.cookie = `inventra_user=${cookiePayload}; Max-Age=900; Path=/; SameSite=Lax`;
  localStorage.removeItem('twofaEmail');

        // Redirect to corresponding frontend
        switch (role) {
          case 'SUPERADMIN':
            window.location.href = 'http://localhost:4600/dashboard';
            break;
          case 'ADMIN':
            window.location.href = 'http://localhost:4400/dashboard';
            break;
          case 'STAFF':
            window.location.href = 'http://localhost:4500/dashboard';
            break;
          default:
            alert('Invalid role.');
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
      const response = await fetch('http://localhost:4000/api/resend-code', {
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
