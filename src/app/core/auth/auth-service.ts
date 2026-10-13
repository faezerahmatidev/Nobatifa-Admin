import { inject, Injectable, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom, from, map, Observable, of } from 'rxjs';
import { SUPABASE_CLIENT } from '../backend/supabase-client';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  readonly id: string;
  readonly mobile: string;
}

/**
 * Admin session over Supabase Auth (phone + password, per Figma login).
 * Guards are a usability layer only; data protection lives in RLS (Phase 4+).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  readonly user = signal<AdminUser | null>(null);
  readonly initialized = signal(false);

  async init(): Promise<void> {
    const session = await firstValueFrom(this.refresh());
    this.user.set(session);
    this.initialized.set(true);
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user.set(
        session?.user ? { id: session.user.id, mobile: session.user.phone ?? '' } : null,
      );
    });
  }

  login(mobile: string, password: string): Observable<AdminUser> {
    // Dev-only demo login (documented): production always hits Supabase.
    if (!environment.production && password === DEV_DEMO_PASSWORD) {
      const admin: AdminUser = { id: 'dev-admin', mobile: mobile.trim() };
      this.user.set(admin);
      return of(admin);
    }
    return from(
      this.supabase.auth.signInWithPassword({ phone: toE164(mobile), password }),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const user = data.user;
        if (!user) {
          throw new Error('ورود ناموفق بود');
        }
        const admin: AdminUser = { id: user.id, mobile: user.phone ?? '' };
        this.user.set(admin);
        return admin;
      }),
    );
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  private refresh(): Observable<AdminUser | null> {
    return from(this.supabase.auth.getSession()).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        const user = data.session?.user;
        return user ? { id: user.id, mobile: user.phone ?? '' } : null;
      }),
    );
  }
}

/** Dev-only demo password. NEVER accepted in production builds. */
export const DEV_DEMO_PASSWORD = 'admin1234';

/** Mirrors the user-app convention: Iranian `09…` mobiles map to E.164. */
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
