import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { ServicesPage } from './services-page';

describe('ServicesPage', () => {
  it('renders toggles and flips one', async () => {
    TestBed.configureTestingModule({
      imports: [ServicesPage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(ServicesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('تعویض روغن');
    const switches = el.querySelectorAll('[role="switch"]');
    expect(switches.length).toBe(8);
    (switches[3] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect((switches[3] as HTMLButtonElement).getAttribute('aria-checked')).toBe('true');
  }, 10000);
});
