import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../backend/supabase-client';
import { authGuard } from './auth-guard';
import { AuthService } from './auth-service';

@Component({ template: '' })
class Dummy {}

function setup(loggedIn: boolean): Router {
  TestBed.configureTestingModule({
    imports: [],
    providers: [
      AuthService,
      provideRouter([
        { path: 'login', component: Dummy },
        { path: '', component: Dummy, canActivate: [authGuard] },
      ]),
      {
        provide: SUPABASE_CLIENT,
        useValue: {
          auth: {
            getSession: () =>
              Promise.resolve({
                data: loggedIn ? { session: { user: { id: 'a1', phone: '' } } } : { session: null },
                error: null,
              }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
          },
        } as unknown as SupabaseClient,
      },
    ],
  });
  return TestBed.inject(Router);
}

describe('authGuard', () => {
  it('allows logged-in admins', async () => {
    const router = setup(true);
    await TestBed.inject(AuthService).init();
    expect(await router.navigate(['/'])).toBe(true);
    expect(router.url).toBe('/');
  });

  it('redirects guests to login', async () => {
    const router = setup(false);
    await TestBed.inject(AuthService).init();
    expect(await router.navigate(['/'])).toBe(true);
    expect(router.url).toBe('/login');
  });
});
