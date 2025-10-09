import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './apiService';
import { BehaviorSubject } from 'rxjs';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private googleClientId = '214414241265-ldcgmnam676v2vvov2a2nd711bljifp2.apps.googleusercontent.com';
  public isReady$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService, private toastr: ToastrService) {
    this.loadGoogleScript();
  }

  /** Load Google Sign-In script dynamically */
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

  /** Initialize Google Sign-In */
  private initializeGoogleSignIn(): void {
    setTimeout(() => {
      if (!google?.accounts) {
        this.toastr.error('Google accounts not available', 'Error');
        return;
      }

      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      this.isReady$.next(true);
      console.log('Google Sign-In initialized');
    }, 100);
  }

  /** Trigger Google Sign-In prompt */
  public signIn(): void {
    if (!google?.accounts) {
      this.toastr.warning('Google Sign-In not ready. Please try again.', 'Info');
      this.loadGoogleScript();
      return;
    }

    try {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap prompt dismissed or not displayed');
        }
      });
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      this.toastr.error('Failed to open Google Sign-In', 'Error');
    }
  }

  /** Handle response from Google */
  private handleGoogleResponse(response: any): void {
    const credential = response?.credential;
    if (!credential) {
      this.toastr.warning('Google login was cancelled.', 'Info');
      return;
    }

    this.apiService.googleAuth({ token: credential }).subscribe({
      next: (res: any) => {
        this.toastr.success('Logged in with Google successfully!', 'Success');
        localStorage.setItem('token', res.token);
      },
      error: (err) => this.toastr.error(err.error?.message || 'Google login failed', 'Error')
    });
  }

  /** Cancel Google One Tap */
  public cancel(): void {
    if (google?.accounts?.id) {
      google.accounts.id.cancel();
    }
  }

  /** Sign out the user */
public signOut(): void {
  if (google?.accounts?.id) {
    google.accounts.id.disableAutoSelect(); 
    google.accounts.id.cancel();         
  }

  this.toastr.success('You have been signed out.', 'Success');
}

}
