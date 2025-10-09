import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
import { GoogleAuthService } from '../../../helpers/services/googleService';
declare const google: any;
@Component( {
  selector: 'app-signup',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
  templateUrl: './signup.component.html',
  styleUrls: [ './signup.component.scss', '../../../../styles/shared-styles.scss' ]
} )
export class SignupComponent implements OnDestroy{
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading= false;
  submitted = false;


  constructor( private fb: FormBuilder, private apiService: ApiService, private toastr: ToastrService,private router:Router,private google:GoogleAuthService ) {
    this.registerForm = this.fb.group( {
      firstName: [ '', [ Validators.required, Validators.minLength( 2 ) ] ],
      lastName: [ '', [ Validators.required, Validators.minLength( 2 ) ] ],
      gender: [ '', [ Validators.required ] ],
      nickName: [ '', [ Validators.required, Validators.minLength( 2 ) ] ],
      email: [ '', [ Validators.required, Validators.email ] ],
      password: [ '', [ Validators.required, Validators.minLength( 6 ) ] ],
      confirmPassword: [ '', [ Validators.required ] ],
      preparingFor: [ '', [ Validators.required ] ]
    }, {
      validators: this.passwordMatchValidator
    } );
  }

  // Custom validator to check if passwords match
  passwordMatchValidator( control: AbstractControl ): ValidationErrors | null {
    const password = control.get( 'password' );
    const confirmPassword = control.get( 'confirmPassword' );

    if ( !password || !confirmPassword ) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  // Helper method to check if field should show error
  isFieldInvalid( fieldName: string ): boolean {
    const field = this.registerForm.get( fieldName );
    return !!( field && field.invalid && ( field.touched || this.submitted ) );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    if ( this.registerForm.invalid ) {
      Object.keys( this.registerForm.controls ).forEach( key => {
        this.registerForm.get( key )?.markAsTouched();
      } );
      return;
    }
    this.loading=true
    const payload = {
      email:this.registerForm.value.email,
      password:this.registerForm.value.password,
      last_name:this.registerForm.value.lastName,
      first_name:this.registerForm.value.firstName,
      gender:this.registerForm.value.gender,
      nickname:this.registerForm.value.nickName,
      preparing_for: this.registerForm.value.preparingFor
    }
    this.apiService.register( payload ).subscribe( {
      next: ( response: any ) => {
        if ( response?.detail ) {
          this.toastr.success( response.detail, 'success');
          this.router.navigate(['/login']);
          this.loading=false
        } else {
           this.loading=false
          this.toastr.success( 'Registration successful! Please log in.', 'Success' );
        }
      },
      error: ( error: any ) => {
        if ( error.status === 400 && error.error?.details ) {
          const details = error.error.details;
           this.loading=false
          Object.keys( details ).forEach( field => {
            details[ field ].forEach( ( msg: string ) => {
              this.toastr.error( msg, 'Validation Error' );
            } );
          } );
        }
        else {
           this.loading=false
          this.toastr.error(
            error.error?.message || error.message || 'Registration failed. Please try again.',
            'Error'
          );
        }
      }
    } );
  }


 registerWithGoogle(): void {
  this.google.signIn()
  }

  registerWithApple(): void {
    console.log( 'Register with Apple' );
  }

  ngOnDestroy(): void {
    this.google.cancel();
  }
}