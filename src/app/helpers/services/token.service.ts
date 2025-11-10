// src/app/helpers/services/token.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TokenInfo {
  total_tokens: number;
  used_tokens: number;
  remaining_tokens: number;
  last_updated: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private tokenInfoSubject = new BehaviorSubject<TokenInfo | null>(null);
  public tokenInfo$ = this.tokenInfoSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('token_info');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.tokenInfoSubject.next(parsed);
      } catch (e) {
      }
    }
  }

  private saveToStorage(tokenInfo: TokenInfo): void {
    localStorage.setItem('token_info', JSON.stringify(tokenInfo));
  }

  updateFromHeaders(headers: any): void {
    const remainingTokens = headers.get('X-User-Remaining-Tokens');
    
    if (remainingTokens !== null) {
      const remaining = parseInt(remainingTokens, 10);
      
      if (!isNaN(remaining)) {
        const currentInfo = this.tokenInfoSubject.value;
        
        const updatedInfo: TokenInfo = {
          total_tokens: currentInfo?.total_tokens || 0,
          used_tokens: currentInfo ? currentInfo.total_tokens - remaining : 0,
          remaining_tokens: remaining,
          last_updated: new Date().toISOString()
        };
        
        this.tokenInfoSubject.next(updatedInfo);
        this.saveToStorage(updatedInfo);
        
      }
    }
  }

  updateFullInfo(tokenInfo: TokenInfo): void {
    const updatedInfo = {
      ...tokenInfo,
      last_updated: new Date().toISOString()
    };
    
    this.tokenInfoSubject.next(updatedInfo);
    this.saveToStorage(updatedInfo);
  }

  getCurrentTokenInfo(): TokenInfo | null {
    return this.tokenInfoSubject.value;
  }

  clearTokenInfo(): void {
    this.tokenInfoSubject.next(null);
    localStorage.removeItem('token_info');
  }
}