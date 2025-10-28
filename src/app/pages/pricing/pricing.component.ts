<<<<<<< HEAD
import { Component } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> 8eb66a8 (fixed the new changes)
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { NewlineToBreakPipe } from '../../helpers/pipe/NewlineToBreakPipe';
import { FooterComponent } from '../footer/footer.component';
<<<<<<< HEAD
=======
import { ApiService } from '../../helpers/services/apiService';
>>>>>>> 8eb66a8 (fixed the new changes)

interface PricingPlan {
  name: string;
  description: string;
  price: string;
<<<<<<< HEAD
=======
  amount: number; // Amount in rupees
>>>>>>> 8eb66a8 (fixed the new changes)
  priceLabel: string;
  features: string[];
  buttonText: string;
  buttonClass: string;
  isPopular?: boolean;
}
<<<<<<< HEAD
@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule,HeaderComponent,NewlineToBreakPipe,FooterComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
 plans: PricingPlan[] = [
=======

declare var Razorpay: any;

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NewlineToBreakPipe, FooterComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  plans: PricingPlan[] = [
>>>>>>> 8eb66a8 (fixed the new changes)
    {
      name: 'Basic',
      description: 'Essential tools to manage finances, perfect for\nindividuals and startups.',
      price: '₹185',
<<<<<<< HEAD
      priceLabel: 'AI-powered notes  & summaries',
=======
      amount: 185,
      priceLabel: 'AI-powered notes & summaries',
>>>>>>> 8eb66a8 (fixed the new changes)
      features: [
        '25k words input',
        '10k words output',
        'Unlimited PDF File Download',
        'Upload & analyze 1 study image',
        'Premium Ai Results',
        'Better Results form \'free to GPT-5\''
      ],
      buttonText: 'Start with Starter Plan',
      buttonClass: 'btn-outline'
    },
    {
      name: 'Pro',
      description: 'Serious asptrants preparing for big\n exams.',
      price: '₹485',
<<<<<<< HEAD
      priceLabel: 'AI-powered notes  & summaries',
=======
      amount: 485,
      priceLabel: 'AI-powered notes & summaries',
>>>>>>> 8eb66a8 (fixed the new changes)
      features: [
        '90k words input',
        '30k words output',
        'Unlimited PDF File Download',
        'Premium Ai Results',
        'Upload & analyze 2 study image',
        'Better Results form \'free to GPT-5\''
      ],
      buttonText: 'Upgrade to Pro',
      buttonClass: 'btn-primary',
      isPopular: true
    },
    {
      name: 'Enterprise',
      description: 'Essential tools to manage finances, perfect for\n individuals and startups.',
      price: '₹855',
<<<<<<< HEAD
      priceLabel: 'AI-powered notes  & summaries',
=======
      amount: 855,
      priceLabel: 'AI-powered notes & summaries',
>>>>>>> 8eb66a8 (fixed the new changes)
      features: [
        '100k words input',
        '55k words output',
        'Unlimited PDF File Download',
        'Premium Ai Results',
        'Upload & analyze 4 study image',
        'Better Results form \'free to GPT-5\''
      ],
      buttonText: 'Upgrade to Premium',
      buttonClass: 'btn-outline'
    }
  ];

<<<<<<< HEAD
  onSelectPlan(planName: string): void {
    console.log('Selected plan:', planName);
  }
}
=======
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Load Razorpay script
    this.loadRazorpayScript();
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
    // Create order from backend
    this.apiService.createSubscriptionOrder({
      amount: plan.amount,
      planName: plan.name
    }).subscribe({
      next: (response) => {
        console.log(response)
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
      key: orderData.key, // Razorpay key from backend
      amount: orderData.amount, // Amount in paise
      currency: orderData.currency || 'INR',
      name: 'ComputED AI',
      description: `${plan.name} Plan - ${plan.priceLabel}`,
      image: 'assets/images/logo.png', // Your logo
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
        plan_name: plan.name
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
      plan_name: plan.name
    }).subscribe({
      next: (verifyResponse) => {
        alert(`Payment successful! Welcome to ${plan.name} plan.`);
        // Redirect to dashboard or show success message
        // this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Payment verification failed:', error);
        alert('Payment completed but verification failed. Please contact support.');
      }
    });
  }

  handlePaymentFailure(response: any): void {
    console.error('Payment failed:', response);
    alert(`Payment failed: ${response.error.description}`);
  }
}
>>>>>>> 8eb66a8 (fixed the new changes)
