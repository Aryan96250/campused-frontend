import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgOtpInputModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss', '../../../../../styles/shared-styles.scss']
})
export class OtpComponent {
  otpForm: FormGroup;
  submitted = false;
  email = 'hello@email.com';
  resendTimer = 60;
  canResend = false;
  otp: string = '';
  loading = false;
  
  otpConfig = {
    length: 6,
    allowNumbersOnly: true,
    placeholder: '',
    inputClass: 'otp-input-field',
    containerClass: 'otp-inputs'
  };

  private timerInterval: any;

  constructor(private fb: FormBuilder, private Router: Router) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.startResendTimer();
  }

  onOtpChange(otp: string) {
    this.otp = otp;
    this.otpForm.patchValue({ otp: otp });
  }

  startResendTimer() {
    this.canResend = false;
    this.resendTimer = 60;

    this.timerInterval = setInterval(() => {
      this.resendTimer--;

      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  resendOtp() {
    if (this.canResend) {
      console.log('Resending OTP...');
      this.startResendTimer();
      this.otp = '';
      this.otpForm.reset();
    }
  }

  onSubmit() {
    this.submitted = true;

    if ( this.otpForm.invalid || this.otp.length !== 6 ) {
      return;
    }
    this.loading = true;
    setTimeout( () => {
      console.log( 'Form Data:', this.otpForm.value );
      this.loading = false;
      this.Router.navigate(['/reset-password']);
    }, 2000 );
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}