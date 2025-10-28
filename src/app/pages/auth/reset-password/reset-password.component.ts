import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
=======
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
>>>>>>> 8eb66a8 (fixed the new changes)

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

<<<<<<< HEAD
  constructor(private fb: FormBuilder,private router: Router) {
=======
  constructor(private fb: FormBuilder,private router: Router,private apiService:ApiService
    ,private toastr:ToastrService,private route: ActivatedRoute,
  ) {
>>>>>>> 8eb66a8 (fixed the new changes)
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

<<<<<<< HEAD
  onSubmit() {
    this.submitted = true;

    // Validation check
=======
  token: string | null = null;

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.token = params['token'] || null;
    // if (!this.token) {
    //   this.router.navigate(['/login']);
    // }
  });
}

  onSubmit() {
    this.submitted = true;
>>>>>>> 8eb66a8 (fixed the new changes)
    if (
      this.passwordForm.invalid ||
      this.passwordForm.value.password !== this.passwordForm.value.confirmPassword
    ) {
      return;
    }

    this.loading = true;
<<<<<<< HEAD
    setTimeout(() => {
      console.log('New Password:', this.passwordForm.value.password);
      this.loading = false;
      this.router.navigate(['/login']);
      // Navigate to login or dashboard here
    }, 2000);
=======
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

    nevigate(){
    this.router.navigate([''])
>>>>>>> 8eb66a8 (fixed the new changes)
  }
}
