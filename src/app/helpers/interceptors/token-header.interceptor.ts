import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
export const tokenHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.log('Response received:', event.status);
        console.log('Headers:', event.headers.keys());
        const remainingTokens = event.headers.get('X-User-Remaining-Tokens');
        console.log('X-User-Remaining-Tokens header:', remainingTokens);
        tokenService.updateFromHeaders(event.headers);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error.status, error.message);
      
      // Handle 402 Payment Required
      if (error.status === 402) {
        console.log('402 Error - Redirecting to pricing page');
        
        // Extract remaining tokens from error response if available
        if (error.headers) {
          tokenService.updateFromHeaders(error.headers);
        }
        
        // Show error message if available in response body
        const errorMsg = error.error?.error || error.error?.message || 'Insufficient tokens';
        console.log('Error message:', errorMsg);
        
        // Navigate to pricing page
        setTimeout(() => {
          router.navigate(['/pricing']);
        }, 1500);
      }
      
      return throwError(() => error);
    })
  );
};