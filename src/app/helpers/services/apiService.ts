// src/app/helpers/services/apiService.ts
import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import { Observable } from 'rxjs';
=======
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

>>>>>>> 8eb66a8 (fixed the new changes)
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  register(payload:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, payload);
  }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signin`, payload);
  }

  forgotPassword(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, payload);
  }

    googleAuth(payload:any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google-auth`, payload);
  }
}
=======
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

verifyEmail(token: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/auth/verify-email`, {
    params: { token }
  });
}

  googleAuth(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google-auth`, payload);
  }

  // ---------- CHANNELS ----------
  createChannel(initialMessage?: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/channel/`, initialMessage ?? {});
  }

  listChannels(): Observable<Array<{ id: string; title: string }>> {
    return this.http.get<Array<{ id: string; title: string }>>(
      `${this.baseUrl}/channel/list-channels`
    );
  }

  getChannel(channelId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/channel/${channelId}`);
  }

  // ---------- CHAT (text + files) ----------
  sendMessageMultipart(channelId: string, q: string, files: File[]) {
    const form = new FormData();
    form.append('q', q ?? '');
    form.append('channel_id', channelId);
    for (const f of files ?? []) form.append('files', f, f.name);
    return this.http.post(`${this.baseUrl}/channel/${channelId}`, form);
  }

  sendFirstMessage(q: string, files: File[]) {
    const form = new FormData();
    form.append('q', q ?? '');
    for (const f of files ?? []) form.append('files', f, f.name);
    return this.http.post(`${this.baseUrl}/channel/`, form);
  }

  // ---------- SUBSCRIPTIONS / RAZORPAY ----------
  createSubscriptionOrder(payload: { amount: number; planName: string }): Observable<any> {
    // POST /subscriptions/create-order
    // Expected response: { order_id, amount, currency, key_id, prefill: {...} }
    return this.http.post(`${this.baseUrl}/subscriptions/create-order`, payload);
  }

  verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan_name: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscriptions/verify-payment`, payload);
  }

  getSubscriptionStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/subscriptions/status`);
  }
}
>>>>>>> 8eb66a8 (fixed the new changes)
