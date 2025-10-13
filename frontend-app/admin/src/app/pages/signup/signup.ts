import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  firstName = '';
  lastName = '';
  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(private auth: Auth, private router: Router) {}

  async signUp() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      // Update profile name (Firebase displayName)
      await updateProfile(user, {
        displayName: `${this.firstName} ${this.lastName}`,
      });

      console.log('User signed up:', user);
      alert('Account created successfully!');
      this.router.navigate(['/dashboard']); // redirect after signup
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Password should be at least 6 characters.';
      } else {
        this.errorMessage = 'Failed to create account. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async signUpWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      console.log('Google sign-up success:', user);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      this.errorMessage = 'Failed to sign up with Google.';
    } finally {
      this.loading = false;
    }
  }
}
