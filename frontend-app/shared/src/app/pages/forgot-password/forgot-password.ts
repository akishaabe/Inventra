import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  email = '';
  error = '';
  sending = false;

  constructor(private router: Router) {}

 onSubmit(form: NgForm) {
  this.error = '';

  if (!form.valid) {
    this.error = 'Please enter a valid email address.';
    return;
  }

  this.sending = true;


fetch(`${environment.apiBase}/send-reset-code`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: this.email })
})

  .then(async res => {
    if (!res.ok) throw new Error(await res.text());

    
    localStorage.setItem('resetEmail', this.email);

  this.router.navigate(['/verify-code'], { queryParams: { email: this.email } });
  })
  .catch(err => {
    this.error = 'Failed to send verification code.';
    console.error(err);
  })
  .finally(() => this.sending = false);
}
}