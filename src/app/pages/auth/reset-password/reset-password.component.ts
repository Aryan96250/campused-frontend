import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private fb: FormBuilder,private router: Router,private apiService:ApiService
    ,private toastr:ToastrService,private route: ActivatedRoute,
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  token: string | null = null;

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.token = params['token'] || null;
    if (!this.token) {
      this.router.navigate(['/login']);
    }
  });
}

  onSubmit() {
    this.submitted = true;
    if (
      this.passwordForm.invalid ||
      this.passwordForm.value.password !== this.passwordForm.value.confirmPassword
    ) {
      return;
    }

    this.loading = true;
    const payload ={
      token:this.token,
      new_password:this.passwordForm.value.password,
      confirm_password:this.passwordForm.value.confirmPassword
    }
    this.apiService.resetPassword(payload).subscribe({
      next:(response:any)=>{
        this.loading =false;
        this.router.navigate(['/login']);
       this.toastr.success(response.message, 'success');
      },
      error:(error:any)=>{
       this.toastr.success(error.error || error.detail, 'success');
       this.loading =false;
      }
    })
  }
}
