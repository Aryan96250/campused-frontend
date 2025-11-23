import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../helpers/services/authService';
import { TokenService, TokenInfo } from '../../helpers/services/token.service';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../helpers/services/apiService';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, BsDropdownDirective,
    BsDropdownToggleDirective,
    BsDropdownMenuDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  userName: string | null = null;
  token: any;
  currentUrl: any;
  showButtons: boolean = false;
  showLogoutMenu = false;
  remainingTokens: number = 0;
  totalTokens: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private auth: AuthService,
    private tokenService: TokenService,
    private toastr:ToastrService,
    private apiService:ApiService
  ) {
    this.currentUrl = this.router.url === '/';
    this.userName = localStorage.getItem('userName');
    this.token = localStorage.getItem('access_token');
    if (this.token || this.userName) {
      this.showButtons = true;
    }
    this.fetchTokenCredits();
  }

    private fetchTokenCredits(): void {
    this.apiService.getUserCredits().subscribe({
      next: (response: any) => {
        if (response) {
          this.tokenService.updateFullInfo({
            total_tokens: response.total_tokens || 0,
            used_tokens: response.used_tokens || 0,
            remaining_tokens: response.remaining_tokens || 0,
            last_updated: new Date().toISOString()
          });
        }
      },
      error: (error:any) => {
        if(error.status === 401){
            this.destroy$.next();
        }
        console.error('Failed to fetch token credits', error);
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to token updates
    this.tokenService.tokenInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tokenInfo: TokenInfo | null) => {
        if (tokenInfo) {
          this.remainingTokens = tokenInfo.remaining_tokens;
          this.totalTokens = tokenInfo.total_tokens;
        }
      });
  }

  toggleLogoutMenu(event: Event) {
    event.stopPropagation();
    this.showLogoutMenu = !this.showLogoutMenu;
  }

  logout() {
    this.showLogoutMenu = false;
    this.showButtons = false;
    this.tokenService.clearTokenInfo();
    this.toastr.success('You have been signed out.', 'Success');
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.brand-wrapper')) {
      this.showLogoutMenu = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.nav');
    
    if (!clickedInside && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  getTokenPercentage(): number {
    if (this.totalTokens === 0) return 0;
    return (this.remainingTokens / this.totalTokens) * 100;
  }

  formatTokens(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  neviagteBack(){
    this.router.navigateByUrl('')
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}