import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  email: string = '';
  error: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    this.error = '';


    console.log('Sending verification code to:', this.email);

    this.router.navigate(['/verify-code']);
  }
}
