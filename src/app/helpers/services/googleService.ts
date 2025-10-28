<<<<<<< HEAD
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './apiService';
import { BehaviorSubject } from 'rxjs';
=======
import { Injectable, Injector } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './apiService';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './authService';
import { Router } from '@angular/router';
>>>>>>> 8eb66a8 (fixed the new changes)

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
<<<<<<< HEAD
  private googleClientId = '214414241265-ldcgmnam676v2vvov2a2nd711bljifp2.apps.googleusercontent.com';
  public isReady$ = new BehaviorSubject<boolean>(false);
  private injector: Injector;

  constructor(
    injector: Injector,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router:Router
  ) {
    this.injector = injector;
    this.loadGoogleScript();
  }

  /** Load Google Sign-In script dynamically */
=======
  private googleClientId = environment.googleClientId;
  public isReady$ = new BehaviorSubject<boolean>(false);
  private injector: Injector;

  constructor(
    injector: Injector,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router:Router
  ) {
    this.injector = injector;
    this.loadGoogleScript();
  }

>>>>>>> 8eb66a8 (fixed the new changes)
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

<<<<<<< HEAD
  /** Initialize Google Sign-In */
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
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleResponse(response),
      auto_select: false,
      itp_support: true,
      cancel_on_tap_outside: true,
      // use_fedcm_for_prompt: false 
    });

    this.isReady$.next(true);
    console.log('Google Sign-In initialized with FedCM');
  }

  /** Trigger Google Sign-In prompt */
=======
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
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleResponse(response),
      auto_select: false,
      itp_support: true,
      cancel_on_tap_outside: true,
      // use_fedcm_for_prompt: false 
    });

    this.isReady$.next(true);
    console.log('Google Sign-In initialized with FedCM');
  }

>>>>>>> 8eb66a8 (fixed the new changes)
  public signIn(): void {
    if (!google?.accounts) {
      this.toastr.warning('Google Sign-In not ready. Please try again.', 'Info');
      this.loadGoogleScript();
      return;
    }

    try {
      google.accounts.id.prompt((notification: any) => {
<<<<<<< HEAD
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap prompt dismissed or not displayed');
        }
=======
        // FedCM-compatible: Only handle dismissal (unchanged)
        if (notification.isDismissedMoment()) {
          console.log('One Tap prompt dismissed by user');
          // Optional: Show alternative sign-in options
        }
        // Removed: isNotDisplayed(), isSkippedMoment() – deprecated with FedCM
>>>>>>> 8eb66a8 (fixed the new changes)
      });
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      this.toastr.error('Failed to open Google Sign-In', 'Error');
    }
  }

<<<<<<< HEAD
  /** Handle response from Google */
  private handleGoogleResponse(response: any): void {
    const credential = response?.credential;
=======
  private handleGoogleResponse(response: any): void {
    const credential = response?.credential;
    console.log(response,'wewe')
>>>>>>> 8eb66a8 (fixed the new changes)
    if (!credential) {
      this.toastr.warning('Google login was cancelled.', 'Info');
      return;
    }
<<<<<<< HEAD

    this.apiService.googleAuth({ token: credential }).subscribe({
      next: (res: any) => {
        this.toastr.success('Logged in with Google successfully!', 'Success');
        const authService = this.injector.get(AuthService);
        localStorage.setItem('userName',res.name)
        authService.setToken(res); // Adjust if response has 'access_token'
        this.router.navigate(['/chat'])
      },
      error: (err) => {
        console.error('Google auth API error:', err); // Log for CORS/network debugging
        this.toastr.error(err.error?.message || 'Google login failed', 'Error');
      }
    });
  }

  /** Cancel Google One Tap */
=======
 
    const body = {
      id_token:credential
    }
    console.log(body,'kkkk')
    this.apiService.googleAuth(body).subscribe({
      next: (res: any) => {
        this.toastr.success('Logged in with Google successfully!', 'Success');
        const authService = this.injector.get(AuthService);
        localStorage.setItem('userName',res.name)
        authService.setToken(res); // Adjust if response has 'access_token'
        this.router.navigate(['/chat'])
      },
      error: (err) => {
        console.error('Google auth API error:', err); // Log for CORS/network debugging
        this.toastr.error(err.error?.message || 'Google login failed', 'Error');
      }
    });
  }

>>>>>>> 8eb66a8 (fixed the new changes)
  public cancel(): void {
    if (google?.accounts?.id) {
      google.accounts.id.cancel();
    }
  }

<<<<<<< HEAD
  /** Sign out the user */
public signOut(): void {
  if (google?.accounts?.id) {
    google.accounts.id.disableAutoSelect(); 
    google.accounts.id.cancel();         
  }

  this.toastr.success('You have been signed out.', 'Success');
}

}
=======
  public signOut(): void {
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
      google.accounts.id.cancel();
    }
    const authService = this.injector.get(AuthService);
    authService.clearToken();
    this.toastr.success('You have been signed out.', 'Success');
  }
}
>>>>>>> 8eb66a8 (fixed the new changes)
