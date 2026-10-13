import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { RegisterCustomerPage } from './register-customer-page';

describe('RegisterCustomerPage', () => {
  it('walks mobile, code and profile steps', async () => {
    TestBed.configureTestingModule({
      imports: [RegisterCustomerPage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(RegisterCustomerPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('شماره موبایل مشتری');
    const mobile = el.querySelector('input[aria-label="شماره موبایل مشتری"]') as HTMLInputElement;
    mobile.value = '09120000001';
    mobile.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    let next = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('مرحله بعد'),
    ) as HTMLButtonElement;
    next.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
    expect(el.textContent).toContain('کد تایید');
    const boxes = el.querySelectorAll('app-otp-input input');
    ['1', '2', '3', '4'].forEach((digit, index) => {
      (boxes[index] as HTMLInputElement).value = digit;
      boxes[index].dispatchEvent(new Event('input'));
    });
    fixture.detectChanges();
    next = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('مرحله بعد'),
    ) as HTMLButtonElement;
    next.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
    expect(el.textContent).toContain('مشخصات مشتری');
  }, 15000);
});
