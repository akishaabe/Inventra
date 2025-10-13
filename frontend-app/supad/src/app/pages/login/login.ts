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
  this.loading = true;
  try {
    const response = await fetch('http://localhost:4000/api/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('twofaEmail', this.email);
      this.router.navigate(['/twofa']);
    } else {
      alert(data.error || 'Failed to send verification code.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to connect to server.');
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