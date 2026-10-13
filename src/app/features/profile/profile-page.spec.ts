import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  it('renders profile and saves names', async () => {
    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('اتوسرویس محمد');
    expect((el.querySelectorAll('input')[0] as HTMLInputElement).value).toBe('محمد');
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    expect(el.textContent).toContain('ذخیره شد');
  }, 10000);

  it('edits mobile and password through dialogs', async () => {
    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const mobileButton = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('ویرایش شماره موبایل'),
    ) as HTMLButtonElement;
    mobileButton.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')?.textContent).toContain('ویرایش شماره موبایل');
    const mobileInput = el.querySelector('input[aria-label="شماره موبایل جدید"]') as HTMLInputElement;
    mobileInput.value = '09120000002';
    mobileInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const save = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('ذخیره'),
    ) as HTMLButtonElement;
    save.click();
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeNull();

    const passwordButton = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('ویرایش رمز عبور'),
    ) as HTMLButtonElement;
    passwordButton.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')?.textContent).toContain('ویرایش رمز عبور');
  }, 10000);
});
