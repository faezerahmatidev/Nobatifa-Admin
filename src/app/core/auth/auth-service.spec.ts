import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../backend/supabase-client';
import { AuthService, toE164 } from './auth-service';

function setup(
  auth: Record<string, () => Promise<unknown>> = {},
  sessionUser: { id: string; phone: string } | null = null,
): AuthService {
  TestBed.configureTestingModule({
    providers: [
      AuthService,
      {
        provide: SUPABASE_CLIENT,
        useValue: {
          auth: {
            getSession: () =>
              Promise.resolve({ data: { session: sessionUser ? { user: sessionUser } : null }, error: null }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
            ...auth,
          },
        } as unknown as SupabaseClient,
      },
    ],
  });
  return TestBed.inject(AuthService);
}

describe('toE164', () => {
  it('maps iranian mobiles', () => {
    expect(toE164('09123456789')).toBe('+989123456789');
    expect(() => toE164('123')).toThrow('شماره موبایل معتبر نیست');
  });
});

describe('AuthService', () => {
  it('logs in with the dev demo password without calling the api', async () => {
    let called = false;
    const service = setup({
      signInWithPassword: () => {
        called = true;
        return Promise.resolve({ data: {}, error: null });
      },
    });
    const user = await firstValueFrom(service.login('09123456789', 'admin1234'));
    expect(user).toEqual({ id: 'dev-admin', mobile: '09123456789' });
    expect(called).toBe(false);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logs in and stores the session user', async () => {
    const service = setup({
      signInWithPassword: () =>
        Promise.resolve({ data: { user: { id: 'a1', phone: '+989123456789' } }, error: null }),
    });
    const user = await firstValueFrom(
      service.login('09123456789', 'secret123'),
    );
    expect(user).toEqual({ id: 'a1', mobile: '+989123456789' });
    expect(service.isLoggedIn()).toBe(true);
  });

  it('surfaces credential failures', async () => {
    const service = setup({
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null }, error: { message: 'Invalid credentials' } }),
    });
    await expect(firstValueFrom(service.login('09123456789', 'wrong'))).rejects.toThrow(
      'Invalid credentials',
    );
    expect(service.isLoggedIn()).toBe(false);
  });

  it('restores the session on init and clears it on logout', async () => {
    const service = setup({}, { id: 'a1', phone: '+989123456789' });
    await service.init();
    expect(service.isLoggedIn()).toBe(true);
    await service.logout();
    expect(service.isLoggedIn()).toBe(false);
  });
});
