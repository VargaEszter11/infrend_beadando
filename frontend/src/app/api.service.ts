import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  get token(): string {
    return localStorage.getItem('token') ?? '';
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  private authHeaders(): { headers: HttpHeaders } {
    const token = this.token;
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : { headers: new HttpHeaders() };
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`);
  }

  post<T>(path: string, body: unknown, withAuth = false): Observable<T> {
    return withAuth
      ? this.http.post<T>(`${this.baseUrl}${path}`, body, this.authHeaders())
      : this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, this.authHeaders());
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, this.authHeaders());
  }
}
