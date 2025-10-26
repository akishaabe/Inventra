import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleAuthProvider, signInWithPopup, Auth } from '@angular/fire/auth';

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

  constructor(private router: Router) {}

  // Normal email login that triggers 2FA code
  async onSubmit() {
    if (!this.email) {
      alert('Please enter your email.');
      return;
    }

    this.loading = true;
    try {
      const response = await fetch('http://localhost:4000/api/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('twofaEmail', this.email);
        localStorage.setItem('userRole', data.role);
        console.log(`Verification code generated for ${this.email}. Check backend console for code.`);
        this.router.navigate(['/twofa']);
      } else {
        alert(data.error || 'Failed to generate verification code.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      alert('Failed to connect to server.');
    } finally {
      this.loading = false;
    }
  }

  // Google login that triggers 2FA code
  async loginWithGoogle() {
    this.loading = true;
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.auth, provider);
      const email = result.user.email;

      if (!email) {
        alert('Google account has no email.');
        return;
      }

      // Trigger backend 2FA code generation
      const response = await fetch('http://localhost:4000/api/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('twofaEmail', email);
        localStorage.setItem('userRole', data.role);
        console.log(`Verification code generated for ${email}. Check backend console for code.`);
        this.router.navigate(['/twofa']);
      } else {
        alert(data.error || 'Failed to generate verification code.');
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      alert('Google Sign-In failed. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
