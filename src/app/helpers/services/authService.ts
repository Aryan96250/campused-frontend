<<<<<<< HEAD
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
=======
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
>>>>>>> 8eb66a8 (fixed the new changes)
import { GoogleAuthService } from './googleService';

interface AuthResponse {
  message: string;
  access_token: string;
}

interface User {
  token: string;
  // Add other user properties as needed
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'access_token';
<<<<<<< HEAD

  constructor(private googleService:GoogleAuthService) {
    // Initialize with token from localStorage if it exists
    const token = localStorage.getItem(this.tokenKey);
=======
  private userName = 'user_name';
  private injector: Injector;

  constructor(injector: Injector) {
    this.injector = injector;

    const token = this.getTokenFromStorage();
>>>>>>> 8eb66a8 (fixed the new changes)
    this.currentUserSubject = new BehaviorSubject<User | null>(
      token ? { token } : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
<<<<<<< HEAD
    return localStorage.getItem(this.tokenKey);
  }

  setToken(response: AuthResponse): void {
    if (response.access_token) {
      localStorage.setItem(this.tokenKey, response.access_token);
=======
    return this.getTokenFromStorage();
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  setToken(response: AuthResponse, rememberMe: boolean = false): void {
    if (response.access_token) {
      // const storage = rememberMe ? localStorage : sessionStorage;
      localStorage.setItem(this.tokenKey, response.access_token);
      // Clear the other storage to avoid conflicts
      // if (rememberMe) sessionStorage.removeItem(this.tokenKey);
      // else localStorage.removeItem(this.tokenKey);

>>>>>>> 8eb66a8 (fixed the new changes)
      this.currentUserSubject.next({ token: response.access_token });
    }
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
<<<<<<< HEAD
=======
    sessionStorage.removeItem(this.tokenKey);
>>>>>>> 8eb66a8 (fixed the new changes)
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
<<<<<<< HEAD
    this.clearToken();
    this.googleService.signOut()
  }
}
=======
    try {
      localStorage.clear();
      sessionStorage.clear();
      const googleService = this.injector.get(GoogleAuthService);
      googleService.signOut();
    } catch (error) {
      console.error('Error signing out from Google during logout:', error);
    } finally {
      this.clearToken();
    }
  }
}
>>>>>>> 8eb66a8 (fixed the new changes)
