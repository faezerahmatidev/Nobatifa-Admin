import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../backend/supabase-client';
import { AdminShell } from './admin-shell';
import { AuthService } from '../auth/auth-service';

@Component({ template: '' })
class Dummy {}

function setup(user: { id: string; phone: string } | null): void {
  TestBed.configureTestingModule({
    imports: [AdminShell],
    providers: [
      AuthService,
      provideRouter([{ path: 'login', component: Dummy }]),
      {
        provide: SUPABASE_CLIENT,
        useValue: {
          auth: {
            getSession: () =>
              Promise.resolve({ data: { session: user ? { user } : null }, error: null }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
          },
        } as unknown as SupabaseClient,
      },
    ],
  });
}

describe('AdminShell', () => {
  it('renders nav, breadcrumb, date and staff card', async () => {
    setup({ id: 'a1', phone: '+989123456789' });
    const fixture = TestBed.createComponent(AdminShell);
    await TestBed.inject(AuthService).init();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    for (const label of ['داشبورد', 'نوبت‌ها', 'مدیریت زمان', 'فاکتورها', 'مدیریت خدمات']) {
      expect(el.textContent).toContain(label);
    }
    expect(el.textContent).toContain('پنل');
    expect(el.textContent).toContain('+989123456789');
    expect(el.querySelector('[data-testid="drawer-backdrop"]')).toBeNull();
  });

  it('opens and closes the mobile drawer', async () => {
    setup({ id: 'a1', phone: '' });
    const fixture = TestBed.createComponent(AdminShell);
    await TestBed.inject(AuthService).init();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('[aria-label="منو"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="drawer-backdrop"]')).toBeTruthy();
    (el.querySelector('[data-testid="drawer-backdrop"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="drawer-backdrop"]')).toBeNull();
  });

  it('logs out and returns to login', async () => {
    setup({ id: 'a1', phone: '' });
    const fixture = TestBed.createComponent(AdminShell);
    await TestBed.inject(AuthService).init();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const logout = Array.from(el.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'خروج',
    ) as HTMLButtonElement;
    logout.click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
