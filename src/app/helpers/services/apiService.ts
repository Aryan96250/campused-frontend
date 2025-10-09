import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(payload:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, payload);
  }

  login( payload:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signin`, payload);
  }

   forgotPassword(payload: { email: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, payload);
  }

    googleAuth(payload:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google-auth`, payload);
  }
}
