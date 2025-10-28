import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
<<<<<<< HEAD
import { RouterLink } from '@angular/router';
=======
import { Router, RouterLink } from '@angular/router'; // Added Router
>>>>>>> 8eb66a8 (fixed the new changes)
import { ApiService } from '../../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../helpers/services/authService';
import { GoogleAuthService } from '../../../helpers/services/googleService';
<<<<<<< HEAD
=======
import { takeUntil } from 'rxjs/operators'; // For unsubscribe if needed
import { Subject } from 'rxjs';
>>>>>>> 8eb66a8 (fixed the new changes)

@Component({
  selector: 'app-login',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss','../../../../styles/shared-styles.scss']
})
export class LoginComponent implements OnDestroy {
   loginForm: FormGroup;
  showPassword = false;
  submitted = false;
  loading =false;

  constructor(private fb: FormBuilder,private apiService:ApiService,private toastr: ToastrService,private auth:AuthService,private google:GoogleAuthService) {
=======
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
>>>>>>> 8eb66a8 (fixed the new changes)
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

<<<<<<< HEAD
  // Helper method to check if field should show error
=======
>>>>>>> 8eb66a8 (fixed the new changes)
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
<<<<<<< HEAD
      // Mark all fields as touched to show validation
=======
>>>>>>> 8eb66a8 (fixed the new changes)
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }
<<<<<<< HEAD
     this.loading = true;

    const payload = {
      email:this.loginForm.value.email,
      password:this.loginForm.value.password,
      remember_me : this.loginForm.value.rememberMe
    }
    this.apiService.login(payload).subscribe({
      next:(response:any)=>{
       this.loading =false;
        this.auth.setToken(response);
       this.toastr.success(response.message, 'success');
      },
      error:(error:any)=>{
       this.toastr.success(error.error || error.detail, 'success');
       this.loading =false;
      }
    })
  }
  
  loginWithGoogle(): void {
    this.google.signIn()
  }

  loginWithApple(): void {
    console.log('Login with Apple');
  }

  ngOnDestroy(): void {
    this.google.cancel()
=======

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
        localStorage.setItem('userName',response.name)
        this.toastr.success(response.message || 'Login successful', 'Success');
        this.router.navigate(['/chat']);
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

  nevigate(){
    this.router.navigate([''])
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.google.cancel();
>>>>>>> 8eb66a8 (fixed the new changes)
  }
}