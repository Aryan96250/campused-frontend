import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export const HttpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  // Always clone request
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  console.log('Request headers:', authReq.headers.keys());

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
        localStorage.removeItem('access_token');
        router.navigate(['/login']);
        toastr.error('Session expired. Please login again.', 'Unauthorized');
      } else {
        toastr.error(errorMessage, 'Error');
      }

      return throwError(() => error);
    })
  );
};
