import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { Resend } from 'resend';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  form = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    agree: false
  };

  // Password strength state
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSymbol = false;
  isLengthValid = false;

  strength = 0;
  strengthColor = '';
  strengthLabel = '';

  private auth = inject(Auth);
  private resend = new Resend('re_29KHLZqH_9eEuBgEVfnKXqi5pWoEM6r98');

  constructor(private router: Router) {}

  // ✅ Validate domain
  isValidDomain(email: string): boolean {
    const domainPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return domainPattern.test(email);
  }

  // ✅ Validate password format
  isPasswordValid(password: string): boolean {
    const pattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return pattern.test(password);
  }

  // ✅ Handle password input + strength logic
  onPasswordInput() {
    const pw = this.form.password;
    this.hasUppercase = /[A-Z]/.test(pw);
    this.hasLowercase = /[a-z]/.test(pw);
    this.hasNumber = /\d/.test(pw);
    this.hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    this.isLengthValid = pw.length >= 8;

    const trueCount = [
      this.hasUppercase,
      this.hasLowercase,
      this.hasNumber,
      this.hasSymbol,
      this.isLengthValid
    ].filter(Boolean).length;

    this.strength = trueCount;

    const colors = ['#ff4d4d', '#ff944d', '#ffcc00', '#99cc00', '#4CAF50'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

    this.strengthColor = colors[trueCount - 1] || '#ddd';
    this.strengthLabel = labels[trueCount - 1] || '';
  }

  // ✅ Handle normal signup submit
  async onSubmit() {
    if (!this.isValidDomain(this.form.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!this.isPasswordValid(this.form.password)) {
      alert('Password does not meet requirements.');
      return;
    }

    if (!this.form.agree) {
      alert('Please agree to the Terms and Conditions.');
      return;
    }

  try {
    // ✅ Generate random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const expirationTime = Date.now() + 5 * 60 * 1000;

    // ✅ Store info temporarily (for twofa page to access)
    localStorage.setItem('twofaEmail', this.form.email);
    localStorage.setItem('twofaCode', verificationCode);
     localStorage.setItem('twofaExpiresAt', expirationTime.toString());

    // ✅ Send the verification code email (using Resend)
    await this.resend.emails.send({
      from: 'Inventra <noreply@inventra.com>',
      to: this.form.email,
      subject: 'Your Inventra 2FA Verification Code',
      html: `
        <h2>Two-Factor Authentication</h2>
        <p>Hello ${this.form.firstName || ''},</p>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 4px;">${verificationCode}</h1>
        <p>This code will expire in 5 minutes.</p>
        <p>- The Inventra Team</p>
      `
    });

    // ✅ Redirect to 2FA verification page
    this.router.navigate(['/twofa']);
  } catch (error) {
    console.error('Error during sign up:', error);
    alert('Failed to send verification code. Please try again.');
  }
}

  // ✅ Handle Google Sign-Up
  async signUpWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.auth, provider);
      const email = result.user.email || '';

      // Send welcome email via Resend
      await this.resend.emails.send({
        from: 'Inventra <noreply@inventra.com>',
        to: email,
        subject: 'Welcome to Inventra!',
        html: `
          <h2>Welcome to Inventra!</h2>
          <p>Hello ${result.user.displayName || ''},</p>
          <p>Thank you for signing up using Google. You can now log in and start using your account.</p>
          <p>- The Inventra Team</p>
        `
      });

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Google Sign-Up failed:', error);
      alert('Google Sign-Up failed. Please try again.');
    }
  }
}
