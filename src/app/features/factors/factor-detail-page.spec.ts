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

  it('copies the invoice text when web share is unavailable', async () => {
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
    let copied = '';
    const clipboard = { writeText: (text: string) => ((copied = text), Promise.resolve()) };
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
    const el = fixture.nativeElement as HTMLElement;
    const share = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('به اشتراک‌گذاری'),
    ) as HTMLButtonElement;
    share.click();
    await new Promise((resolve) => setTimeout(resolve, 200));
    fixture.detectChanges();
    expect(copied).toContain('000085752257');
    expect(el.textContent).toContain('حافظه کپی شد');
  }, 10000);
});
