import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule, Router } from '@angular/router';

@Component( {
  selector: 'app-header',
  imports: [ CommonModule, RouterLink, RouterModule ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
} )
export class HeaderComponent{
  currentPath: any;
  currentUrl: any;

  constructor(private router: Router) {
    this.currentPath = this.router.url == "/pricing"; 
    this.currentUrl = this.router.url == '/'  
    console.log(this.currentPath, this.currentUrl) // gives "/pricing"
  }     


}
=======
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
  mobileMenuOpen = false;
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

  toggleMobileMenu(): void {
  this.mobileMenuOpen = !this.mobileMenuOpen;
  
  // Prevent body scroll when menu is open
  if (this.mobileMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

closeMobileMenu(): void {
  this.mobileMenuOpen = false;
  document.body.style.overflow = '';
}

// Optional: Close menu when clicking outside
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const clickedInside = target.closest('.nav');
  
  if (!clickedInside && this.mobileMenuOpen) {
    this.closeMobileMenu();
  }
}
}
>>>>>>> 8eb66a8 (fixed the new changes)
