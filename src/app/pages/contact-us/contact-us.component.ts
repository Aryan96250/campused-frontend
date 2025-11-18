import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ApiService } from '../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
import { noOnlySpaces } from '../../helpers/message.validators';
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
      message: ['', [Validators.required, noOnlySpaces]]
    });
  }

onSubmit(): void {
  if (this.contactForm.invalid) {
    this.contactForm.markAllAsTouched();
    return;
  }

  this.loading = true;

  const { name, email, company, subject, message } = this.contactForm.value;

  const body = {
    name,
    email,
    company,
    subject,
    message: message.trim()
  };

  this.apiService.sendContactMessage(body).subscribe({
    next: () => {
      this.toastr.success('Your message has been sent successfully!', 'Success');
      this.contactForm.reset();
      this.loading = false;
    },
    error: () => {
      this.toastr.error('There was an error sending your message. Please try again later.', 'Error');
      this.loading = false;
    }
  });
}


  getDirection() {
    window.open('https://maps.google.com', '_blank');
  }
}
