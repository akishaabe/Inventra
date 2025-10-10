import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.css']
})
export class VerifyCode {
  code: string[] = ['', '', '', '', '', ''];
  error: string = '';

  constructor(private router: Router) {}

  onInput(event: any, index: number) {
    const value = event.target.value;
    if (value && index < 5) {
      document.getElementById('code-' + (index + 1))?.focus();
    }
  }

  onSubmit() {
    const enteredCode = this.code.join('');
    if (enteredCode.length !== 6) {
      this.error = 'Please enter all 6 digits.';
      return;
    }

    this.error = '';

    console.log('Verifying code:', enteredCode);

    this.router.navigate(['/reset-password']);
  }
}
