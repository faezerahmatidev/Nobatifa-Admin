import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable, tap, throwError } from 'rxjs';
import { AUTH_GATEWAY } from './auth-gateway';

export interface AdminUser {
  readonly id: string;
  readonly mobile: string;
}

/**
 * Admin session (mock backend only — see MockAuthGateway).
 * Guards are a usability layer; no real authorization exists offline.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(AUTH_GATEWAY);

  readonly user = signal<AdminUser | null>(null);
  readonly initialized = signal(false);

  async init(): Promise<void> {
    const session = await firstValueFrom(this.auth.currentSession());
    this.user.set(session);
    this.initialized.set(true);
  }

  login(mobile: string, password: string): Observable<AdminUser> {
    try {
      toE164(mobile);
    } catch (error) {
      return throwError(() => error);
    }
    return this.auth
      .login(mobile.trim(), password)
      .pipe(tap((user) => this.user.set(user)));
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.auth.logout());
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }
}

/** Iranian `09…` mobiles map to E.164. */
export function toE164(mobile: string): string {
  const value = mobile.trim();
  if (/^09\d{9}$/.test(value)) {
    return `+98${value.slice(1)}`;
  }
  if (/^\+98\d{10}$/.test(value)) {
    return value;
  }
  throw new Error('شماره موبایل معتبر نیست');
}
