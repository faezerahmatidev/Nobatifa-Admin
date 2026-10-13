import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { FactorDetailPage } from './factor-detail-page';

describe('FactorDetailPage', () => {
  it('renders the invoice detail', async () => {
    TestBed.configureTestingModule({
      imports: [FactorDetailPage],
      providers: [
        provideRouter([]),
        ...provideMockAdminAccess(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'inv-1' }) } },
        },
      ],
    });
    const fixture = TestBed.createComponent(FactorDetailPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('مشخصات فردی');
    expect(el.textContent).toContain('مشخصات پرداخت');
    expect(el.textContent).toContain('به اشتراک‌گذاری');
  }, 10000);
});
