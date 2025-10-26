import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.css']
})
export class VerifyCode implements OnInit {
  code: string[] = ['', '', '', '', '', ''];
  codeDigits = Array(6).fill(0);
  sending = false;
  error = '';
  timer = 30;
  canResend = false;
  interval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startTimer();
  }

  onInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && index < 5) {
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

  onSubmit() {
    this.sending = true;
    this.error = '';

    const email = localStorage.getItem('resetEmail');
    const enteredCode = this.code.join('');

    if (!enteredCode || enteredCode.length < 6) {
      this.error = 'Please enter all 6 digits.';
      this.sending = false;
      return;
    }

    fetch('http://localhost:4000/api/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: enteredCode })
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        // Persist code for the actual reset step
        localStorage.setItem('resetCode', enteredCode);
        this.router.navigate(['/reset-password']);
      })
      .catch(async err => {
        this.error = 'Invalid or expired verification code.';
        console.error(err);
      })
      .finally(() => (this.sending = false));
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

  resendCode() {
    if (!this.canResend) return;
    const email = localStorage.getItem('resetEmail');
    if (!email) return;
    this.startTimer();
    fetch('http://localhost:4000/api/send-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(() => alert('Verification code resent!'))
      .catch(() => alert('Failed to resend verification code.'));
  }
}
