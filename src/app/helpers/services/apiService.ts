// src/app/helpers/services/apiService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---------- AUTH ----------
  register(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, payload);
  } // [web:19]

  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signin`, payload);
  } // [web:19]

  forgotPassword(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, payload);
  } // [web:19]

  resetPassword(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, payload);
  } // [web:19]

  googleAuth(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google-auth`, payload);
  } // [web:19]

  // ---------- CHANNELS ----------
  createChannel(initialMessage?: any): Observable<any> {
    // POST /channel  -> returns { id, title }
    return this.http.post(`${this.baseUrl}/channel/`, initialMessage ?? {});
  } // [web:19]

  listChannels(): Observable<Array<{ id: string; title: string }>> {
    // GET /channel/list-channels
    return this.http.get<Array<{ id: string; title: string }>>(
      `${this.baseUrl}/channel/list-channels`
    );
  } // [web:19]

  getChannel(channelId: string): Observable<any> {
    // GET /channel/:id  -> returns conversation array
    return this.http.get(`${this.baseUrl}/channel/${channelId}`);
  } // [web:19]

  // ---------- CHAT (text + files) ----------
  // POST /channel/:id   body: multipart form-data  { q, files[], channel_id }
// keep existing method for subsequent sends
sendMessageMultipart(channelId: string, q: string, files: File[]) {
  const form = new FormData();
  form.append('q', q ?? '');
  form.append('channel_id', channelId);
  for (const f of files ?? []) form.append('files', f, f.name);
  return this.http.post(`${this.baseUrl}/channel/${channelId}`, form);
} // [web:19]
 // [web:10][web:13]
  // src/app/helpers/services/apiService.ts (add one helper)
sendFirstMessage(q: string, files: File[]) {
  const form = new FormData();
  form.append('q', q ?? '');
  for (const f of files ?? []) form.append('files', f, f.name);
  // POST /channel with multipart when there is no channel yet
  return this.http.post(`${this.baseUrl}/channel/`, form);
} // returns { channel_id, title, messages ... } per your backend contract [web:19]

}
