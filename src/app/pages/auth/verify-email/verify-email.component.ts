import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../helpers/services/apiService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule,FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  standalone:true
})
export class VerifyEmailComponent {
 isLoading = true;
  showSuccessModal = false;
  showErrorModal = false;
  errorMessage = 'User does not exist.';
  countdown = 3;
  private apiUrl = '{{url}}/auth/verify-email'; // Replace with your actual API URL
  handleError: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    // Get token from query parameters
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        this.verifyEmail(token);
      } else {
        this.handleError('No verification token found.');
      }
    });
  }

  verifyEmail(token: string): void {

this.api.verifyEmail(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccessModal = true;
        this.startCountdown();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = error.error?.detail || 'User does not exist.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid or expired verification token.';
        } else {
          this.errorMessage = 'An error occurred during verification. Please try again.';
        }
        
        this.showErrorModal = true;
        this.startCountdown();
      }
    });
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.redirectToLogin();
      }
    }, 1000);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
