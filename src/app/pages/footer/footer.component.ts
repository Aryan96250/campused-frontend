import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  companyLinks = [
    { label: 'About us', url: '#' },
    { label: 'Careers', url: '#' },
    { label: 'Search trends', url: '#' },
    { label: 'Blog', url: '#' },
    { label: 'Events', url: '#' }
  ];

  socialLinks = [
    { label: 'Instagram', url: '#' },
    { label: 'Youtube', url: '#' },
    { label: 'LinkedIn', url: '#' },
    { label: 'Discord', url: '#' },
    { label: 'Reddit', url: '#' },
    { label: 'Help Center', url: '#' }
  ];
}