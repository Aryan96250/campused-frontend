import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';


const TOKEN_KEY = 'somm-ai-auth-token';
const RATING_KEY = 'somm-ai-rating';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser!: Observable<any>;
  public loginModal = new  BehaviorSubject<string>('');

  //private
  private currentUserSubject!: BehaviorSubject<any>;
  public profilePicUpdate = new BehaviorSubject<boolean>(false);

  loggedOut!: boolean;
  tempToken: string = '';
  subsAll:any=[];
  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   * @param {UserBalanceService} _userBalanceService
   */
  constructor(
  
    private navCrtl: Router,
  ) {
    this.checkToken();
  }

  checkToken() {
    let locToken = localStorage.getItem(TOKEN_KEY);
    if (locToken) {
      this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(locToken));
      this.currentUser = this.currentUserSubject.asObservable();
    } else {
      this.currentUserSubject = new BehaviorSubject<any>(null);
      this.currentUser = this.currentUserSubject.asObservable();
    }
  }

  updateTokenValue(updatedUser: any) {
    if (updatedUser && updatedUser.token) {
      localStorage.setItem(TOKEN_KEY,JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  // getter: currentUserValue
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }  
  /**
   * User logout
   *
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('Somma-Ai'); //clear chats
    localStorage.removeItem('calibrationTest'); // clears test result
    // remove theme mode
    localStorage.removeItem('theme-mode');
    // notify
    this.currentUserSubject.next(null);
    // set logout flag
    this.loggedOut = true;
    this.navCrtl.navigate(['/authentication']);

  }

  setLogin(user:any) {
    if (user && user.token) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
      this.loggedOut = false;
    }
  }

  SetSocialLogin(socialuser:any, user:any) {
    if (user && user.token) {
      user.social_user = socialuser;
      localStorage.setItem(TOKEN_KEY,JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
      this.loggedOut = false;
    }
  }

  errorToaster(data: any, toToast = true) {
    if (data.error && data.msg) {
      if (data.auth == false) {
        if (!this.loggedOut) {
          // show toaster for session out;
          if (toToast) {
            // 'Your session is expired, please login again.'
            this.logout();
          }
        }
        this.loggedOut = true;
      } else {
        // show default retuned error;
        if (toToast) {
          console.log(data.msg);
        }
      }
    }
  }

  markFormAsDirty(from:any) {
    for (const key in from.controls) {
      if (Object.prototype.hasOwnProperty.call(from.controls, key)) {
        from.controls[key].markAsDirty();
      }
    }
  }

  setRatingData(data:any){
    const prevRating = this.getRatingData();
    const ratingData = {  ...data, user: this.currentUserValue.email};
    let newRating: any[] = [];
    if(prevRating && prevRating.length){
      newRating = [ ...prevRating, ratingData ];
    }
    else newRating = [ ratingData ];
    localStorage.setItem(RATING_KEY,JSON.stringify(newRating));
  }

  getRatingData():any[]{
    let locRating =localStorage.getItem(RATING_KEY);
    if (locRating && locRating.length) return JSON.parse(locRating);
    else return [];
  }
}
