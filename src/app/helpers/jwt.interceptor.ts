import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './services/authService';
import { FileCacheService } from './services/file-cache.service';

export const HttpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);
  const fileCache = inject(FileCacheService);

  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.error) {
        if (typeof error.error === 'string') errorMessage = error.error;
        else if (error.error.error) errorMessage = error.error.error;
        else if (error.error.message) errorMessage = error.error.message;
        else if (error.error.detail) errorMessage = error.error.detail;
      }

      if (error.status === 401) {
        fileCache.clear();
        localStorage.removeItem('access_token');
        authService.logout();
        router.navigate(['/login']);
        toastr.error('Session expired. Please login again.', 'Unauthorized');
      } else if (error.status === 400) {
        toastr.error("something went wrong", 'Bad Request');
      } else {
        toastr.error(errorMessage, 'Error');
      }

      return throwError(() => error);
    })
  );
};
