import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, switchMap, tap } from 'rxjs/operators';
import { AuthenticationService } from './auth/authentication.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../services/api.service';
export const InterceptorSkipHeader = 'X-Skip-Interceptor';
export const InterceptorSkipAuthHeader = 'X-SkipAuth-Interceptor';
import { jwtDecode } from 'jwt-decode';
import { EncryptionService } from './encryption/encryption.service';
import { ToastController } from '@ionic/angular';
// import baseapiurl 
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  /**
   *
   * @param {AuthenticationService} _authenticationService
   */
  constructor( private _authenticationService: AuthenticationService, private encryptionService: EncryptionService, private api: ApiService, private toaster: ToastController ) {}

  /**
   * Add auth header with jwt if user is logged in and request is to api url
   * @param request
   * @param next
   */
  intercept( request: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
    const currentUser = this._authenticationService.currentUserValue;
    console.log( currentUser );
    const isLoggedIn = currentUser && currentUser.token;
    const token = localStorage.getItem( 'sommai-auth-token' );
    const decodeToken = currentUser ? JSON.parse( this.encryptionService.decode( token ) ) : null
    const isApiUrl = request.url.startsWith( environment.baseApiUrl );
    const openEndpoints = [
      'get_all_participants',
      'first-screening',
      'Second-screening',
      'complaints'
    ];
    // check if the request url contains any of these open endpoints
    const isApiUrlsOpen = openEndpoints.some( endpoint =>
      request.url.includes( `${ environment.baseApiUrl }${ endpoint }` )
    );
    let decodedToken: any;
    let currentTime: any;
    if ( decodeToken && decodeToken.token ) {
      decodedToken = jwtDecode( decodeToken.token );
      currentTime = Math.floor( Date.now() / 1000 );
    }
    let modifiedRequest = request.clone( {
      setHeaders: {
        // Version: environment.ios_version,
      },
    } );

    const skipAuth = request.headers.has( InterceptorSkipAuthHeader );
    if ( skipAuth ) {
      modifiedRequest = modifiedRequest.clone( { headers: modifiedRequest.headers.delete( InterceptorSkipAuthHeader ) } );
      return next.handle( modifiedRequest );
    }
    if ( isApiUrl ) {
      if ( isLoggedIn ) {
        if ( isApiUrlsOpen ) {
          modifiedRequest = modifiedRequest.clone( {
            setHeaders: {
              Authorization: `Token ${ currentUser.token }`,
            }
          } );
        } else {
          modifiedRequest = modifiedRequest.clone( {
            setHeaders: {
              Authorization: `Bearer ${ currentUser.token }`,
            }
          } );
        }
      } else if ( this._authenticationService.tempToken ) {
        if ( isApiUrlsOpen ) {
          modifiedRequest = modifiedRequest.clone( {
            setHeaders: {
              Authorization: `Token ${ this._authenticationService.tempToken }`,
            }
          } );
        } else {
          modifiedRequest = modifiedRequest.clone( {
            setHeaders: {
              Authorization: `Bearer ${ this._authenticationService.tempToken }`,
            }
          } );
        }
      }
      // if (request.headers.has(InterceptorSkipHeader)) {
      //   request = request.clone({ headers: request.headers.delete(InterceptorSkipHeader) });
      // }
    }

    return next.handle( modifiedRequest ).pipe(
      tap( ev => {
        if ( ev instanceof HttpResponse ) {
          if ( ev.status == 200 && ev.body.auth == false ) {
            this._authenticationService.logout();
          }
        }
      } ),
      catchError( ( err: any ) => {
        if ( err.status === 401 ) {
          return this.handle401Error( modifiedRequest, next ).pipe(
            catchError( refreshErr => {
              console.error( 'Failed to refresh token:', refreshErr );
              this._authenticationService.logout();
              this.presentToast( 'Your session is expired, please login again.', 'danger' );
              return throwError( refreshErr );
            } )
          );
        }
        return throwError( err );
      } )
    );
  }

  private handle401Error( req: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
    const body = {
      refresh_token: this._authenticationService.currentUserValue.refresh_token
    };
    return this.api.refresh( body ).pipe(
      switchMap( ( res: any ) => {
        this._authenticationService.currentUserValue.token = res.access_token;
        const clonedRequest = req.clone( {
          setHeaders: {
            Authorization: `Bearer ${ res.access_token }`,
          }
        } );
        return next.handle( clonedRequest ).pipe(
          retry( 1 ),
          catchError( ( retryError ) => {
            return throwError( retryError );
          } )
        );
      } ),
      catchError( ( refreshError ) => {
        return throwError( refreshError );
      } )
    );
  }

  async presentToast( msg: any, color: any = 'success', position: any = 'top' ) {
    let toast = await this.toaster.create( {
      message: msg,
      color: color,
      position: position,
      duration: 2000
    } )
    toast.present();
  }
}

