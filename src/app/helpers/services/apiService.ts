// src/app/helpers/services/apiService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---------- AUTH ----------
  register(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, payload);
  }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signin`, payload);
  }

  forgotPassword(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, payload);
  }

  resetPassword(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, payload);
  }

  googleAuth(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google-auth`, payload);
  }

  // ---------- CHANNEL ----------
  listChannels(): Observable<any> {
    return this.http.get(`${this.baseUrl}/channel/list-channels`);
  }

  getChannel(channelId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/channel/${channelId}`);
  }

  createChannel(payload: { title: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/channel`, payload);
  }

  // Single handler for send message
  sendMessage(endpoint: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, formData);
  }
}
