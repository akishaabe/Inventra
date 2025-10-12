import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Resend } from 'resend';

@Component({
  selector: 'app-twofa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './twofa.html',
  styleUrls: ['./twofa.css']
})
export class TwoFA implements OnInit {
  code: string[] = ['', '', '', '', '', ''];
  codeDigits = Array(6).fill(0);
  error = '';
  sending = false;
  timer = 30;
  canResend = false;
  interval: any;
  email: string | null = null;

  private resend = new Resend('re_29KHLZqH_9eEuBgEVfnKXqi5pWoEM6r98');

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('twofaEmail');
    this.startTimer();
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

  onSubmit() {
    this.sending = true;
    this.error = '';

    const storedCode = localStorage.getItem('twofaCode');
    const enteredCode = this.code.join('');

    if (!enteredCode || enteredCode.length < 6) {
      this.error = 'Please enter all 6 digits.';
      this.sending = false;
      return;
    }

    if (enteredCode === storedCode) {
      console.log(`✅ 2FA success for ${this.email}`);
      localStorage.removeItem('twofaCode');
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid verification code.';
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

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('twofaCode', newCode);

    await this.resend.emails.send({
      from: 'Inventra <noreply@inventra.com>',
      to: this.email,
      subject: 'Your new 2FA Verification Code',
      html: `<p>Your new verification code is <strong>${newCode}</strong></p>`
    });

    this.startTimer();
  }
}
