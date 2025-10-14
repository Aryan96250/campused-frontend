import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../../helpers/services/apiService';
@Component( {
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ CommonModule, RouterLink, ReactiveFormsModule ],
  templateUrl: './forgot-password.component.html',
  styleUrls: [ './forgot-password.component.scss', '../../../../../styles/shared-styles.scss' ],
} )

export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;
  loading = false;

  constructor( private fb: FormBuilder, private router: Router, private toastr: ToastrService, private api: ApiService ) {
    this.forgotPasswordForm = this.fb.group( {
      email: [ '', [ Validators.required, Validators.email ] ]
    } );
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if ( this.forgotPasswordForm.invalid ) {
      return;
    }
    this.loading = true;
    let body = {
      email:  this.forgotPasswordForm.value.email
    }
    this.api.forgotPassword( body ).subscribe( {
      next: ( response: any ) => {
        this.router.navigate( [ '/reset-password' ] );
        this.toastr.success( response.detail, 'success' )
        this.loading = false;
      },
      error: ( error: any ) => {
        this.loading = false;
        // this.toastr.error( error.email, 'error' )
      }
    } )

  }
}
