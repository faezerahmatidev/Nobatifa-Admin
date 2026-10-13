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
});
