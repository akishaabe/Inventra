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
  confirm = '';
  error = '';
  success = false;
  email = localStorage.getItem('resetEmail') || '';

  constructor(private router: Router) {}

  validatePassword(p: string) {
    if (p.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(p)) return 'Password must include at least one uppercase letter.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return 'Password must include at least one special character.';
    return '';
  }

  onSubmit() {
    this.error = '';
    const v = this.validatePassword(this.password);
    if (v) { this.error = v; return; }
    if (this.password !== this.confirm) { this.error = 'Re-enter the same password to confirm.'; return; }

    setTimeout(() => {
      this.success = true;

      localStorage.removeItem('resetEmail');
    }, 400);
  }

  onOk() {
    this.success = false;
    this.router.navigate(['/login']);
  }
}
