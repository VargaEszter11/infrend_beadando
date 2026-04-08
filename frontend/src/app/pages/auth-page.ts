import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Sign in</h1>
      <p class="text-sm text-slate-400">Create, update, and delete endpoints require a JWT.</p>

      <form
        class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2"
        (ngSubmit)="login()"
      >
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="username"
          name="username"
          placeholder="Username"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="password"
          [(ngModel)]="password"
          name="password"
          placeholder="Password"
          required
        />
        <div class="space-x-2 md:col-span-2">
          <button class="rounded bg-emerald-600 px-4 py-2">Log in</button>
          <button type="button" class="rounded bg-slate-700 px-4 py-2" (click)="register()">Register</button>
          <button type="button" class="rounded bg-rose-700 px-4 py-2" (click)="logout()">Log out</button>
        </div>
      </form>

      <div class="rounded border border-slate-800 bg-slate-900/40 p-3 text-sm">
        Token:
        <span class="font-medium">{{ hasToken ? 'present' : 'none' }}</span>
      </div>

      <div
        *ngIf="message"
        class="rounded border border-sky-700/40 bg-sky-950/40 px-3 py-2 text-sm text-sky-300"
      >
        {{ message }}
      </div>
      <div
        *ngIf="error"
        class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300"
      >
        {{ error }}
      </div>
    </section>
  `,
})
export class AuthPageComponent {
  username = '';
  password = '';
  message = '';
  error = '';

  get hasToken(): boolean {
    return this.api.token.length > 0;
  }

  constructor(private readonly api: ApiService) {}

  register(): void {
    this.api.post<{ message: string }>('/auth/register', { username: this.username, password: this.password }).subscribe({
      next: (r) => {
        this.message = r.message;
        this.error = '';
      },
      error: (e) => (this.error = e.error?.error ?? 'Registration failed'),
    });
  }

  login(): void {
    this.api.post<{ token: string }>('/auth/login', { username: this.username, password: this.password }).subscribe({
      next: (r) => {
        this.api.setToken(r.token);
        this.message = 'Signed in successfully';
        this.error = '';
      },
      error: (e) => (this.error = e.error?.error ?? 'Login failed'),
    });
  }

  logout(): void {
    this.api.clearToken();
    this.message = 'Signed out';
    this.error = '';
  }
}
