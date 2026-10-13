import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
  it('renders today slots by status', async () => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('نوبت‌های امروز');
    expect(el.textContent).toContain('تعطیل');
    expect(el.textContent).toContain('نوبتی ثبت نشده');
    expect(el.textContent).toContain('فائزه رحمتی');
  }, 10000);

  it('registers a walk-in customer through the modal', async () => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const open = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('ثبت مشتری'),
    ) as HTMLButtonElement;
    open.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')?.textContent).toContain('ثبت مشتری حضوری');
    const slotButton = Array.from(
      el.querySelector('[role="dialog"]')?.querySelectorAll('button') ?? [],
    ).find((button) => button.textContent?.trim() === '11:20') as HTMLButtonElement;
    slotButton?.click();
    fixture.detectChanges();
    const name = el.querySelector(
      'input[aria-label="نام و نام خانوادگی مشتری"]',
    ) as HTMLInputElement;
    name.value = 'تست';
    name.dispatchEvent(new Event('input'));
    const mobile = el.querySelector('input[aria-label="شماره موبایل مشتری"]') as HTMLInputElement;
    mobile.value = '09120000001';
    mobile.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const submit = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('ثبت نوبت'),
    ) as HTMLButtonElement;
    submit.click();
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  }, 10000);
});
