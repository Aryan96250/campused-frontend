import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { trigger, state, style, transition, animate } from '@angular/animations'; // Removed 'query, stagger'

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss'],
  animations: [
    // Fade in/up for hero, onboarding, and individual cards
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Bounce in for response
    trigger('bounceIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.3)' }),
        animate('0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
    // Optional: For advanced stagger later, add back with fixed query:
    // trigger('staggerCards', [
    //   transition(':enter', [
    //     query('.dropdown', stagger(100, [
    //       style({ opacity: 0, transform: 'translateY(30px)' }),
    //       animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    //     ]))
    //   ])
    // ])
  ]
})
export class ExamsComponent {
  selections = {
    exam: '',
    subject: '',
    level: '',
    language: '',
    mode: ''
  };

  response: string = '';

  updateResponse() {
    // For now, static demo response
    if (this.selections.exam && this.selections.subject && this.selections.level) {
      this.response = `You chose ${this.selections.exam.toUpperCase()} - ${this.selections.subject} (${this.selections.level} level) in ${this.selections.language || 'English'} using ${this.selections.mode || 'Topic-wise'} mode.`;
    } else {
      this.response = '';
    }
  }
}