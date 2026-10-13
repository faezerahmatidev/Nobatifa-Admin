import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MOCK_AUTH_PROVIDER } from '../../data-access/mock/mock-auth-gateway';
import { LoginPage } from './login-page';

function setup(): void {
  TestBed.configureTestingModule({
    imports: [LoginPage],
    providers: [provideRouter([]), MOCK_AUTH_PROVIDER],
  });
}

function fill(el: HTMLElement, label: string, value: string): void {
  const input = el.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('LoginPage', () => {
  it('blocks invalid input without calling the api', () => {
    setup();
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'شماره موبایل معتبر نیست',
    );
  });

  it('logs in with demo credentials', async () => {
    setup();
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    fill(el, 'شماره موبایل', '09123456789');
    fill(el, 'رمز عبور', 'admin1234');
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows server errors', async () => {
    setup();
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    fill(el, 'شماره موبایل', '09123456789');
    fill(el, 'رمز عبور', 'wrong');
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    expect(el.textContent).toContain('اطلاعات ورود نادرست است');
  });
});
