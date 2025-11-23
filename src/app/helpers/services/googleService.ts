import { Injectable, Injector } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './apiService';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './authService';
import { Router } from '@angular/router';
import { PendingChatService } from './PendingChat';
import { ChatStateService } from './chat.service';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private googleClientId = environment.googleClientId;
  public isReady$ = new BehaviorSubject<boolean>(false);
  private injector: Injector;
  private useFedCM = false; // Toggle based on your needs

  constructor(
    injector: Injector,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private PendingChatService: PendingChatService,
    private ChatStateService: ChatStateService
  ) {
    this.injector = injector;
    this.loadGoogleScript();
  }

  private loadGoogleScript(): void {
    if (document.getElementById('google-signin-script')) {
      this.initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-signin-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => this.initializeGoogleSignIn();
    script.onerror = () => this.toastr.error('Failed to load Google Sign-In.', 'Error');

    document.head.appendChild(script);
  }

  private initializeGoogleSignIn(): void {
    const checkGoogle = () => {
      if (google?.accounts) {
        this.doInitialize();
      } else {
        setTimeout(checkGoogle, 50);
      }
    };
    checkGoogle();
  }

  private doInitialize(): void {
    const config: any = {
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleResponse(response),
      auto_select: false,
      itp_support: true,
      cancel_on_tap_outside: true,
    };

    // Disable FedCM if needed (fixes the error)
    if (!this.useFedCM) {
      config.use_fedcm_for_prompt = false;
    }

    google.accounts.id.initialize(config);

    this.isReady$.next(true);
    console.log(`Google Sign-In initialized ${this.useFedCM ? 'with' : 'without'} FedCM`);
  }

  public signIn(buttonElement?: HTMLElement): void {
    if (!google?.accounts) {
      this.toastr.warning('Google Sign-In not ready. Please try again.', 'Info');
      this.loadGoogleScript();
      return;
    }

    try {
      google.accounts.id.prompt((notification: any) => {
        // Handle dismissal
        if (notification.isDismissedMoment?.()) {
          console.log('One Tap prompt dismissed by user');
          if (buttonElement) {
            this.showButtonFallback(buttonElement);
          }
        }
        
        // Handle when prompt cannot be displayed
        if (notification.isNotDisplayed?.()) {
          console.log('One Tap not displayed, showing button');
          if (buttonElement) {
            this.showButtonFallback(buttonElement);
          }
        }
        
        // Handle skipped moment
        if (notification.isSkippedMoment?.()) {
          console.log('One Tap skipped');
          if (buttonElement) {
            this.showButtonFallback(buttonElement);
          }
        }
      });
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      
      // Fallback to button on any error
      if (buttonElement) {
        this.showButtonFallback(buttonElement);
      } else {
        this.toastr.error(
          'Google Sign-In blocked. Please enable third-party sign-in in your browser settings.',
          'Error',
          { timeOut: 5000 }
        );
      }
    }
  }

  private showButtonFallback(element: HTMLElement): void {
    if (!element) return;
    
    // Clear existing content
    element.innerHTML = '';
    
    // Render Google Sign-In button
    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 300,
    });
    
    this.toastr.info('Please use the button below to sign in', 'Alternative Sign-In', {
      timeOut: 3000
    });
  }

  public renderButton(element: HTMLElement, options?: any): void {
    if (!google?.accounts?.id) {
      console.error('Google Sign-In not ready');
      return;
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 300,
    };

    google.accounts.id.renderButton(element, { ...defaultOptions, ...options });
  }

  private handleGoogleResponse(response: any): void {
    const credential = response?.credential;
    if (!credential) {
      this.toastr.warning('Google login was cancelled.', 'Info');
      return;
    }

    const body = {
      id_token: credential
    };
    
    console.log('Authenticating with Google...');
    
    this.apiService.googleAuth(body).subscribe({
      next: (res: any) => {
        this.toastr.success('Logged in with Google successfully!', 'Success');
        const authService = this.injector.get(AuthService);
        localStorage.setItem('userName', res.name);
        authService.setToken(res);
        
        const returnUrl = new URL(window.location.href).searchParams.get('returnUrl') || '/';
        const pending = this.injector.get(PendingChatService).get();
        
        if (pending && returnUrl === '/chat') {
          this.injector.get(ChatStateService).setInitialData(pending.text, pending.files);
          this.injector.get(PendingChatService).clear();
        }
        
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        if(err.status === 400){
          this.toastr.error('Invalid Google token. Please try again.', 'Error');
          return;
        }else{
          this.toastr.error(err.error?.message || 'Google login failed', 'Error');
        }
        console.error('Google auth API error:', err);
      }
    });
  }

  public cancel(): void {
    if (google?.accounts?.id) {
      google.accounts.id.cancel();
    }
  }

  public signOut(): void {
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
      google.accounts.id.cancel();
    }
    const authService = this.injector.get(AuthService);
    authService.clearToken();
  }
}