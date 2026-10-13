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
});
