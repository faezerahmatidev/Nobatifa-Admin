import { Injectable } from '@angular/core';
import { delay, of, throwError, type Observable } from 'rxjs';
import { AUTH_GATEWAY, type AuthGateway } from '../../core/auth/auth-gateway';
import type { AdminUser } from '../../core/auth/auth-service';

/** Demo credentials for offline preview (documented, mock only). */
export const DEMO_MOBILE = '09123456789';
export const DEMO_PASSWORD = 'admin1234';

const LATENCY_MS = 150;

function respond<T>(value: T): Observable<T> {
  return of(value).pipe(delay(LATENCY_MS));
}

function fail(message: string): Observable<never> {
  return throwError(() => new Error(message)).pipe(delay(LATENCY_MS));
}

/** Frontend-only mock session. NOT a security boundary. */
@Injectable()
export class MockAuthGateway implements AuthGateway {
  private session: AdminUser | null = null;

  login(mobile: string, password: string): Observable<AdminUser> {
    if (!/^09\d{9}$/.test(mobile.trim())) {
      return fail('شماره موبایل معتبر نیست');
    }
    if (password !== DEMO_PASSWORD) {
      return fail('اطلاعات ورود نادرست است');
    }
    this.session = { id: 'staff-1', mobile: mobile.trim() };
    return respond({ ...this.session });
  }

  currentSession(): Observable<AdminUser | null> {
    return respond(this.session ? { ...this.session } : null);
  }

  logout(): Observable<void> {
    this.session = null;
    return respond(undefined);
  }
}

export const MOCK_AUTH_PROVIDER = { provide: AUTH_GATEWAY, useClass: MockAuthGateway };
