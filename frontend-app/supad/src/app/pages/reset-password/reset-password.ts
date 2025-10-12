import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword {
  password = '';
  confirmPassword = '';
  error = '';
  sending = false;
  passwordChanged = false;

  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSymbol = false;
  isLengthValid = false;
  strength = 0;
  strengthLabel = '';
  strengthColor = '';
  passwordsMatch = true;

  constructor(private router: Router) {}

  onPasswordInput() {
    const pw = this.password;

    this.hasUppercase = /[A-Z]/.test(pw);
    this.hasLowercase = /[a-z]/.test(pw);
    this.hasNumber = /\d/.test(pw);
    this.hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    this.isLengthValid = pw.length >= 8;

    let score = 0;
    if (this.hasUppercase) score++;
    if (this.hasLowercase) score++;
    if (this.hasNumber) score++;
    if (this.hasSymbol) score++;
    if (this.isLengthValid) score++;

    this.strength = score;

    if (score <= 2) {
      this.strengthLabel = 'Weak';
      this.strengthColor = 'red';
    } else if (score === 3 || score === 4) {
      this.strengthLabel = 'Medium';
      this.strengthColor = 'orange';
    } else if (score === 5) {
      this.strengthLabel = 'Strong';
      this.strengthColor = 'green';
    }

    this.checkPasswordMatch();
  }

  onConfirmPasswordInput() {
    this.checkPasswordMatch();
  }

  checkPasswordMatch() {
    this.passwordsMatch = this.password === this.confirmPassword || !this.confirmPassword;
  }

  onSubmit() {
    this.error = '';

    if (!this.password || !this.confirmPassword) {
      this.error = 'Please fill out both fields.';
      return;
    }

    const strongPassword =
      this.hasUppercase && this.hasLowercase && this.hasNumber && this.hasSymbol && this.isLengthValid;

    if (!strongPassword) {
      this.error = 'Please make sure your password meets all the requirements.';
      return;
    }

    if (!this.passwordsMatch) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.sending = true;
    setTimeout(() => {
      this.sending = false;
      this.passwordChanged = true;
    }, 1000);
  }

  closePopup() {
    this.passwordChanged = false;
    this.router.navigate(['/dashboard']);
  }
}
