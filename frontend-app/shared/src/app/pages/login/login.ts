import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleAuthProvider, signInWithPopup, Auth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';

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

  // Email/password login: request 2FA code after password verification
  async onSubmit() {
    if (!this.email || !this.password) {
      alert('Please enter your email and password.');
      return;
    }

    this.loading = true;
    try {
      const response = await fetch(`${environment.apiBase}/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Show a specific message if the email is not found
        if (response.status === 404) {
          alert('That email does not exist in our database.');
        } else {
          alert(data.error || 'Invalid email or password.');
        }
        return;
      }

      // Store the email for the 2FA screen and move to /twofa
      localStorage.setItem('twofaEmail', this.email);
      this.router.navigate(['/twofa']);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to connect to server.');
    } finally {
      this.loading = false;
    }
  }

  // Optional: Google login (still triggers code flow if kept)
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

      // Start 2FA flow for Google sign-in (no password required)
      const response = await fetch(`${environment.apiBase}/auth/request-code-google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 404) {
          alert('That email does not exist in our database.');
        } else {
          alert(data.error || 'Failed to start Google login.');
        }
        return;
      }

      localStorage.setItem('twofaEmail', email);
      this.router.navigate(['/twofa']);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      alert('Google Sign-In failed. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
