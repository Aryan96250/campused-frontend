import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export const HttpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
<<<<<<< HEAD
  
  // Get token from localStorage
  const token = localStorage.getItem('access_token');

  // Always clone request
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  console.log('Request headers:', authReq.headers.keys());

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle different error scenarios
=======

  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  // Always clone request
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  console.log('Request headers:', authReq.headers.keys());

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
>>>>>>> 8eb66a8 (fixed the new changes)
      let errorMessage = 'An unexpected error occurred';

      if (error.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.error) {
<<<<<<< HEAD
        // Extract error message from backend response
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.detail) {
          errorMessage = error.error.detail;
        }
      }

      // Handle 401 Unauthorized - redirect to login
=======
        if (typeof error.error === 'string') errorMessage = error.error;
        else if (error.error.error) errorMessage = error.error.error;
        else if (error.error.message) errorMessage = error.error.message;
        else if (error.error.detail) errorMessage = error.error.detail;
      }

>>>>>>> 8eb66a8 (fixed the new changes)
      if (error.status === 401) {
        localStorage.removeItem('access_token');
        router.navigate(['/login']);
        toastr.error('Session expired. Please login again.', 'Unauthorized');
      } else {
<<<<<<< HEAD
        // Show error toast for other errors
=======
>>>>>>> 8eb66a8 (fixed the new changes)
        toastr.error(errorMessage, 'Error');
      }

      return throwError(() => error);
    })
  );
};
