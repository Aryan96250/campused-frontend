import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Route, UrlSegment } from '@angular/router';

import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  /**
   *
   * @param {Router} _router
   * @param {AuthenticationService} _authenticationService
   */
  constructor(private _router: Router, private _authenticationService: AuthenticationService) {}

  // canActivate
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this._authenticationService.currentUserValue;

    if (currentUser?.token) {
      if (state.url === '/authentication') {
        this._router.navigate(['/layout']);
        return false;
      }
      return true; 
    }

    if (state.url !== '/authentication') {
      this._router.navigate(['/authentication']);
      return false;
    }

    return true; // Allow access to authentication page
  }
}