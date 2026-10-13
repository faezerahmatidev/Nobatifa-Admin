import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminUser } from './auth-service';

export interface AuthGateway {
  login(mobile: string, password: string): Observable<AdminUser>;
  currentSession(): Observable<AdminUser | null>;
  logout(): Observable<void>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AuthGateway');
