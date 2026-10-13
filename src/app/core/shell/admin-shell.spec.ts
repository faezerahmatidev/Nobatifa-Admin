import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { MOCK_AUTH_PROVIDER } from '../../data-access/mock/mock-auth-gateway';
import { AdminShell } from './admin-shell';
import { AuthService } from '../auth/auth-service';

@Component({ template: '' })
class Dummy {}

function setup(): void {
  TestBed.configureTestingModule({
    imports: [AdminShell],
    providers: [
      AuthService,
      MOCK_AUTH_PROVIDER,
      provideRouter([{ path: 'login', component: Dummy }]),
    ],
  });
}

describe('AdminShell', () => {
  it('renders nav, breadcrumb, date and staff card', async () => {
    setup();
    const service = TestBed.inject(AuthService);
    await firstValueFrom(service.login('09123456789', 'admin1234'));
    const fixture = TestBed.createComponent(AdminShell);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    for (const label of ['داشبورد', 'نوبت‌ها', 'مدیریت زمان', 'فاکتورها', 'مدیریت خدمات']) {
      expect(el.textContent).toContain(label);
    }
    expect(el.textContent).toContain('پنل');
    expect(el.textContent).toContain('09123456789');
    expect(el.querySelector('[data-testid="drawer-backdrop"]')).toBeNull();
  });

  it('opens and closes the mobile drawer', async () => {
    setup();
    const service = TestBed.inject(AuthService);
    await firstValueFrom(service.login('09123456789', 'admin1234'));
    const fixture = TestBed.createComponent(AdminShell);
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
    setup();
    const service = TestBed.inject(AuthService);
    await firstValueFrom(service.login('09123456789', 'admin1234'));
    const fixture = TestBed.createComponent(AdminShell);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const logout = Array.from(el.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'خروج',
    ) as HTMLButtonElement;
    logout.click();
    fixture.detectChanges();
    const confirm = Array.from(el.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'بله، خارج شو',
    ) as HTMLButtonElement;
    confirm.click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
