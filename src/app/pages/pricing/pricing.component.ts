import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { NewlineToBreakPipe } from '../../helpers/pipe/NewlineToBreakPipe';
import { FooterComponent } from '../footer/footer.component';
import { ApiService } from '../../helpers/services/apiService';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../helpers/services/token.service';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  amount: number; // Amount in rupees
  priceLabel: string;
  token_limit: number;
  features: string[];
  buttonText: string;
  buttonClass: string;
  isPopular?: boolean;
}

declare var Razorpay: any;

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NewlineToBreakPipe, FooterComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  plans: PricingPlan[] = [];
  isLoading: boolean = true;

  constructor(private apiService: ApiService,private toastr: ToastrService,private tokenService: TokenService,
) {}

  ngOnInit(): void {
    this.getPlans();
    this.loadRazorpayScript();
  }

  getPlans(): void {
    this.isLoading = true;
    this.apiService.getSubscriptionPlan().subscribe({
      next: (response) => {
        console.log('Fetched plans from backend:', response);
        this.plans = this.mapApiResponseToPlans(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching plans:', error);
        this.isLoading = false;
        alert('Failed to load pricing plans. Please refresh the page.');
      }
    });   
  }

  mapApiResponseToPlans(apiPlans: any[]): PricingPlan[] {
    return apiPlans.map((plan, index) => {
      const isPro = plan.name.toLowerCase() === 'pro';
      
      return {
        id: plan.id,
        name: this.capitalizeFirstLetter(plan.name),
        description: plan.description,
        price: `₹${plan.price_inr}`,
        amount: plan.price_inr,
        priceLabel: 'AI-powered notes & summaries',
        token_limit: plan.token_limit,
        features: plan.features,
        buttonText: this.getButtonText(plan.name),
        buttonClass: isPro ? 'btn-primary' : 'btn-outline',
        isPopular: isPro
      };
    });
  }

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  getButtonText(planName: string): string {
    const name = planName.toLowerCase();
    switch(name) {
      case 'basic':
        return 'Start with Basic Plan';
      case 'pro':
        return 'Upgrade to Pro';
      case 'enterprise':
        return 'Upgrade to Enterprise';
      default:
        return `Choose ${this.capitalizeFirstLetter(planName)}`;
    }
  }

  loadRazorpayScript(): void {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  onSelectPlan(plan: PricingPlan): void {
    console.log('Selected plan:', plan.name);
    this.initiatePayment(plan);
  }

  initiatePayment(plan: PricingPlan): void {
    let body ={
      plan_id:plan.id
    }
    this.apiService.createSubscriptionOrder(body).subscribe({
      next: (response) => {
        console.log('Order created:', response);
        this.openRazorpayCheckout(response, plan);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Failed to initiate payment. Please try again.');
      }
    });
  }

  openRazorpayCheckout(orderData: any, plan: PricingPlan): void {
    const options = {
      key: orderData.key, 
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'ComputED AI',
      description: `${plan.name} Plan - ${plan.priceLabel}`,
      image: 'assets/images/Logo.png',
      order_id: orderData.order_id,
      handler: (response: any) => {
        this.handlePaymentSuccess(response, plan);
      },
      prefill: {
        name: orderData.prefill?.name || '',
        email: orderData.prefill?.email || '',
        contact: orderData.prefill?.contact || ''
      },
      notes: {
        plan_name: plan.name,
        plan_id: plan.id
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled by user');
        }
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      this.handlePaymentFailure(response);
    });
    razorpay.open();
  }

  handlePaymentSuccess(response: any, plan: PricingPlan): void {
    console.log('Payment successful:', response);
    
    // Verify payment on backend
    this.apiService.verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }).subscribe({
      next: (verifyResponse) => {
        console.log('Payment verified:', verifyResponse);
        this.fetchAndUpdateTokenCredits(plan);
        this.toastr.success(`Payment successful! Welcome to ${plan.name} plan. You now have ${plan.token_limit.toLocaleString()} tokens.`, 'Success');
      },
      error: (error) => {
        console.error('Payment verification failed:', error);
        this.toastr.error('Payment completed but verification failed. Please contact support.', 'Error');
      }
    });
  }

  private fetchAndUpdateTokenCredits(plan: PricingPlan): void {
    this.apiService.getUserCredits().subscribe({
      next: (creditResponse: any) => {
        console.log('Fetched updated token credits:', creditResponse);
        
        // Update the token service with fresh data
        this.tokenService.updateFullInfo({
          total_tokens: creditResponse.total_tokens || 0,
          used_tokens: creditResponse.used_tokens || 0,
          remaining_tokens: creditResponse.remaining_tokens || 0,
          last_updated: new Date().toISOString()
        });
        
        // Show success message
        this.toastr.success(
          `Payment successful! Welcome to ${plan.name} plan. You now have ${creditResponse.remaining_tokens?.toLocaleString() || plan.token_limit.toLocaleString()} tokens.`, 
          'Success',
          { timeOut: 5000 }
        );
      
      },
      error: (error) => {
        console.error('Error fetching token credits:', error);
        
        // Still show success but with generic token info
        this.toastr.success(
          `Payment successful! Welcome to ${plan.name} plan.`, 
          'Success',
          { timeOut: 5000 }
        );
      }
    });
  }

  handlePaymentFailure(response: any): void {
    console.error('Payment failed:', response);
     this.toastr.error(`Payment failed: ${response.error.description}`,'Error');
  }
}