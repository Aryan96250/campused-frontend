import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  constructor(private googleService:GoogleAuthService) {
    // Initialize with token from localStorage if it exists
    const token = localStorage.getItem(this.tokenKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      token ? { token } : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(response: AuthResponse): void {
    if (response.access_token) {
      localStorage.setItem(this.tokenKey, response.access_token);
      this.currentUserSubject.next({ token: response.access_token });
    }
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.clearToken();
    this.googleService.signOut()
  }
}