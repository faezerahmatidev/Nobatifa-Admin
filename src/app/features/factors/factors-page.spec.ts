import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { FactorsPage } from './factors-page';

describe('FactorsPage', () => {
  it('renders the invoice table with pagination', async () => {
    TestBed.configureTestingModule({
      imports: [FactorsPage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(FactorsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('علیرضا رمضانی');
    expect(el.textContent).toContain('نمایش فاکتور');
    expect(el.querySelector('[aria-label="صفحه‌بندی"]')).toBeTruthy();
  }, 10000);
});
