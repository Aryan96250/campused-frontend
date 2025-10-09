import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../helpers/services/authService';
import { GoogleAuthService } from '../../../helpers/services/googleService';

@Component({
  selector: 'app-login',
  standalone: true,
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  // Helper method to check if field should show error
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
      // Mark all fields as touched to show validation
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }
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
  }
}