import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Added Router
import { ApiService } from '../../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../helpers/services/authService';
import { GoogleAuthService } from '../../../helpers/services/googleService';
import { takeUntil } from 'rxjs/operators'; // For unsubscribe if needed
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../../../styles/shared-styles.scss']
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  showPassword = false;
  submitted = false;
  loading = false;
  private destroy$ = new Subject<void>(); // For unsubscribe

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private auth: AuthService,
    private google: GoogleAuthService,
    private router: Router // Injected for navigation
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted));
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      remember_me: this.loginForm.value.rememberMe
    };

    this.apiService.login(payload).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.loading = false;
        // const rememberMe = this.loginForm.value.rememberMe;
        this.auth.setToken(response); // Pass rememberMe flag to AuthService
        this.toastr.success(response.message || 'Login successful', 'Success');
        this.router.navigate(['/dashboard']); // Or wherever you want to go
      },
      error: (error: any) => {
        this.loading = false;
        this.toastr.error(error.error?.message || error.detail || 'Login failed', 'Error'); // Fixed: error toast
      }
    });
  }

  loginWithGoogle(): void {
    this.google.signIn();
  }

  loginWithApple(): void {
    console.log('Login with Apple'); // Implement or remove
  }

  // Add a logout method if needed (e.g., for a button)
  // onLogout(): void {
  //   this.google.signOut(this.auth); // Pass auth to clear token
  //   this.router.navigate(['/login']);
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.google.cancel();
  }
}