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
        const remainingTokens = event.headers.get('X-User-Remaining-Tokens');
        tokenService.updateFromHeaders(event.headers);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 402) {
        if (error.headers) {
          tokenService.updateFromHeaders(error.headers);
        }
        const errorMsg = error.error?.error || error.error?.message || 'Insufficient tokens';
        setTimeout(() => {
          router.navigate(['/pricing']);
        }, 1500);
      }
      
      return throwError(() => error);
    })
  );
};