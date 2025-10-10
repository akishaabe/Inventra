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
  password: string = '';
  confirmPassword: string = '';
  error: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.error = '';

    // 🔹 TODO: Call backend to actually reset password
    console.log('New password set:', this.password);

    this.router.navigate(['/login']);
  }
}
