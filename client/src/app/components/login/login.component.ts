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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.error = 'Username is required.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    const username = this.loginForm.value.username;

    this.authService.login(username).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/lobby']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message || 'An unknown login error occurred.';
        console.error('Login failed:', err);
      },
    });
  }
}
