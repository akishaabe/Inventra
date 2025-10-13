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
  sending = false;
  timer = 30;
  canResend = false;
  interval: any;
  email: string | null = null;
  maskedEmail: string = '';

  constructor(private router: Router) {}

    ngOnInit() {
    this.email = localStorage.getItem('twofaEmail');
    if (!this.email) {
      this.router.navigate(['/login']);
      return;
    }
    this.maskedEmail = this.maskEmail(this.email);
    this.startTimer();
  }

    maskEmail(email: string | null): string {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const maskedName = name[0] + '*'.repeat(Math.max(0, name.length - 2)) + name.slice(-1);
    return `${maskedName}@${domain}`;
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
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
  this.sending = true;
  this.error = '';

  const email = localStorage.getItem('twofaEmail');
  const enteredCode = this.code.join('');

  if (!enteredCode || enteredCode.length < 6) {
    this.error = 'Please enter all 6 digits.';
    this.sending = false;
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: enteredCode })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ 2FA success for ${email}`);
      localStorage.removeItem('twofaCode');
      this.router.navigate(['/dashboard']);
    } else {
      this.error = data.error || 'Invalid or expired verification code.';
    }
  } catch (error) {
    console.error('Verification failed:', error);
    this.error = 'Failed to connect to the server.';
  } finally {
    this.sending = false;
  }
}

  startTimer() {
    this.canResend = false;
    this.timer = 30;
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
  } catch (error) {
    console.error('Error resending code:', error);
    this.error = 'Failed to connect to the server.';
  }
}
}
