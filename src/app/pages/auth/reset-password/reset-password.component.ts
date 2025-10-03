import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss', '../../../../styles/shared-styles.scss']
})
export class ResetPasswordComponent {
passwordForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(private fb: FormBuilder,private router: Router) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.submitted = true;

    // Validation check
    if (
      this.passwordForm.invalid ||
      this.passwordForm.value.password !== this.passwordForm.value.confirmPassword
    ) {
      return;
    }

    this.loading = true;
    setTimeout(() => {
      console.log('New Password:', this.passwordForm.value.password);
      this.loading = false;
      this.router.navigate(['/login']);
      // Navigate to login or dashboard here
    }, 2000);
  }
}
