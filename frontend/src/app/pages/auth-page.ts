import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { formatApiError } from '../api-error.util';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto w-full max-w-xl py-4">
      <section class="space-y-4">
        <h1 class="text-2xl font-semibold">Sign in</h1>

        @if (!isLoggedIn()) {
        <p class="text-sm text-slate-400">Sign in to create, update, or delete records.</p>

        <form
          class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4"
          (ngSubmit)="login()"
        >
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-28" for="auth-username">Username</label>
            <input
              id="auth-username"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="username"
              name="username"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-28" for="auth-password">Password</label>
            <input
              id="auth-password"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
            />
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            <button type="submit" class="rounded bg-emerald-600 px-4 py-2">Log in</button>
            <button type="button" class="rounded bg-slate-700 px-4 py-2" (click)="register()">Register</button>
          </div>
        </form>
        }

        @if (isLoggedIn()) {
        <div class="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p class="text-sm text-slate-300">You are signed in.</p>
          <button type="button" class="rounded bg-rose-700 px-4 py-2" (click)="logout()">Log out</button>
        </div>
        }

        @if (message()) {
        <div class="rounded border border-sky-700/40 bg-sky-950/40 px-3 py-2 text-sm text-sky-300">
          {{ message() }}
        </div>
        }
        @if (error()) {
        <div class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
          {{ error() }}
        </div>
        }
      </section>
    </div>
  `,
})
export class AuthPageComponent {
  private readonly api = inject(ApiService);
  readonly isLoggedIn = this.api.isLoggedIn;

  username = '';
  password = '';
  readonly message = signal('');
  readonly error = signal('');

  private credentialsInvalid(): boolean {
    const u = this.username.trim();
    if (!u || this.password.length === 0) {
      this.error.set('Username and password are required.');
      this.message.set('');
      return true;
    }
    return false;
  }

  register(): void {
    if (this.credentialsInvalid()) return;
    this.api.post<{ message: string }>('/auth/register', { username: this.username.trim(), password: this.password }).subscribe({
      next: (r) => {
        this.message.set(r.message);
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Registration failed')),
    });
  }

  login(): void {
    if (this.credentialsInvalid()) return;
    this.api.post<{ token: string }>('/auth/login', { username: this.username.trim(), password: this.password }).subscribe({
      next: (r) => {
        this.api.setToken(r.token);
        this.message.set('Signed in successfully');
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Login failed')),
    });
  }

  logout(): void {
    this.api.clearToken();
    this.message.set('Signed out');
    this.error.set('');
  }
}
