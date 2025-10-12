import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleAuthProvider, signInWithPopup, Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { Resend } from 'resend';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  private auth = inject(Auth);
  private resend = new Resend('re_29KHLZqH_9eEuBgEVfnKXqi5pWoEM6r98');

  constructor(private router: Router) {}

  async onSubmit() {
    try {
      console.log('Email:', this.email);
      console.log('Password:', this.password);

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      localStorage.setItem('twofaEmail', this.email);
      localStorage.setItem('twofaCode', verificationCode);

    
      await this.resend.emails.send({
        from: 'Inventra <noreply@inventra.com>',
        to: this.email,
        subject: 'Your Inventra 2FA Verification Code',
        html: `
          <h2>Two-Factor Authentication</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 4px;">${verificationCode}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p>- The Inventra Team</p>
        `
      });

      // Redirect to TwoFA page
      this.router.navigate(['/twofa']);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to send verification code. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.auth, provider);
      const email = result.user.email || '';

      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      localStorage.setItem('twofaEmail', email);
      localStorage.setItem('twofaCode', verificationCode);

      await this.resend.emails.send({
        from: 'Inventra <noreply@inventra.com>',
        to: email,
        subject: 'Your Inventra 2FA Verification Code',
        html: `
          <h2>Two-Factor Authentication</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 4px;">${verificationCode}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p>- The Inventra Team</p>
        `
      });

      this.router.navigate(['/twofa']);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      alert('Google Sign-In failed. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}