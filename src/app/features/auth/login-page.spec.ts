import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import { LoginPage } from './login-page';

function setup(signIn: () => Promise<unknown>): void {
  TestBed.configureTestingModule({
    imports: [LoginPage],
    providers: [
      provideRouter([]),
      {
        provide: SUPABASE_CLIENT,
        useValue: {
          auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            signInWithPassword: signIn,
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
          },
        } as unknown as SupabaseClient,
      },
    ],
  });
}

function fill(el: HTMLElement, label: string, value: string): void {
  const input = el.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('LoginPage', () => {
  it('blocks invalid input without calling the api', () => {
    let called = false;
    setup(() => {
      called = true;
      return Promise.resolve({ data: {}, error: null });
    });
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(called).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'شماره موبایل معتبر نیست',
    );
  });

  it('logs in without errors', async () => {
    setup(() =>
      Promise.resolve({
        data: { user: { id: 'a1', phone: '+989123456789' } },
        error: null,
      }),
    );
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    fill(el, 'شماره موبایل', '09123456789');
    fill(el, 'رمز عبور', 'secret123');
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows server errors', async () => {
    setup(() =>
      Promise.resolve({ data: { user: null }, error: { message: 'Invalid credentials' } }),
    );
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    fill(el, 'شماره موبایل', '09123456789');
    fill(el, 'رمز عبور', 'wrong');
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();
    expect(el.textContent).toContain('Invalid credentials');
  });
});
