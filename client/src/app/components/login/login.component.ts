import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isRegisterMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      acceptedPolicy: [false],
    });
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.error = null;

    const policyControl = this.loginForm.get('acceptedPolicy');

    if (this.isRegisterMode) {
      policyControl?.setValidators([Validators.requiredTrue]);
    } else {
      policyControl?.clearValidators();
    }

    policyControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.error = 'All fields are required.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { username, password, acceptedPolicy } = this.loginForm.value;

    const authObservable = this.isRegisterMode
      ? this.authService.register(username, password, acceptedPolicy)
      : this.authService.login(username, password);

    authObservable.subscribe({
      next: () => {
        this.isLoading = false;
        const redirectUrl = this.authService.getRedirectUrl() || '/lobby';
        this.router.navigateByUrl(redirectUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'An error occurred.';
        console.error(
          this.isRegisterMode ? 'Registration failed:' : 'Login failed:',
          err
        );
      },
    });
  }
}
