import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { NewlineToBreakPipe } from '../../helpers/pipe/NewlineToBreakPipe';
import { FooterComponent } from '../footer/footer.component';

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  priceLabel: string;
  features: string[];
  buttonText: string;
  buttonClass: string;
  isPopular?: boolean;
}
@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule,HeaderComponent,NewlineToBreakPipe,FooterComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
 plans: PricingPlan[] = [
    {
      name: 'Basic',
      description: 'Essential tools to manage finances, perfect for\nindividuals and startups.',
      price: '₹185',
      priceLabel: 'AI-powered notes  & summaries',
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
      priceLabel: 'AI-powered notes  & summaries',
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
      priceLabel: 'AI-powered notes  & summaries',
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

  onSelectPlan(planName: string): void {
    console.log('Selected plan:', planName);
  }
}
