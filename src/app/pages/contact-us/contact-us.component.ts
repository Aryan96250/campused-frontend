import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ApiService } from '../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent { 
  contactForm: FormGroup;
  showSuccess = false;
    loading = false;

  constructor(private fb: FormBuilder, private apiService: ApiService,private toastr: ToastrService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
        this.loading = true;
      console.log('Form submitted:', this.contactForm.value);
      
      this.apiService.sendContactMessage(this.contactForm.value).subscribe({
        next: (response:any) => {
          this.showSuccess = true;
          this.contactForm.reset();
          this.loading = false;
          this.toastr.success('Your message has been sent successfully!', 'Success');
          
          setTimeout(() => this.showSuccess = false, 3000);
        },
        error: (error:any) => {
          this.loading = false;
          this.toastr.error('There was an error sending your message. Please try again later.', 'Error');
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  getDirection() {
    window.open('https://maps.google.com', '_blank');
  }
}
