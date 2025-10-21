import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../helpers/services/authService';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule,  BsDropdownDirective,
    BsDropdownToggleDirective,
    BsDropdownMenuDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  userName: string | null = null;
  token: any;
  currentUrl: any;
  showButtons: boolean = false;
  showLogoutMenu = false;

  constructor(private router: Router, private auth: AuthService) {
    this.currentUrl = this.router.url === '/';  // Fixed comparison operator
    this.userName = localStorage.getItem('userName');
    this.token = localStorage.getItem('access_token');
    if (this.token || this.userName) {
      this.showButtons = true;
    }
  }

  toggleLogoutMenu(event: Event) {
    event.stopPropagation();
    console.log('Toggle clicked, current state:', this.showLogoutMenu);
    this.showLogoutMenu = !this.showLogoutMenu;
    console.log('New state:', this.showLogoutMenu);
  }

  logout() {
    // Note: Setting showLogoutMenu to true here might keep the menu open; 
    // consider changing to false if it doesn't hide after logout.
    this.showLogoutMenu = false;  // Updated for better behavior
    this.showButtons = false;
    this.auth.logout();  // Assuming this handles token removal and navigation
  }

  // Close logout menu when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.brand-wrapper')) {
      this.showLogoutMenu = false;
    }
  }
}