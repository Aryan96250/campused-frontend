  import { Component } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Router, RouterLink } from '@angular/router';
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
  @Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss','../../../../../styles/shared-styles.scss'],
  })

  export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
    submitted = false;
      loading = false;

    constructor(private fb: FormBuilder,private router: Router) {
      this.forgotPasswordForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      });
    }

    get f() {
      return this.forgotPasswordForm.controls;
    }

    onSubmit() {
      this.submitted = true;

      if (this.forgotPasswordForm.invalid) {
        return;
      }
     this.loading = true;
    setTimeout(() => {
      console.log('Forgot Password Form:', this.forgotPasswordForm.value);
      this.router.navigate(['/otp']);
      this.loading = false; //  hide loader after request is done
      // Navigate to OTP page here if needed
    }, 2000);
    }
  }
