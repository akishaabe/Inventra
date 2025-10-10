import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleAuthProvider, signInWithPopup, Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';

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

  private auth = inject(Auth);

  constructor(private router: Router) {}


  onSubmit() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    this.router.navigate(['/2fa']);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      console.log('Google user:', result.user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
