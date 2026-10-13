import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { APPOINTMENTS_GATEWAY } from '../../data-access/ports/appointments-gateway';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { AppointmentsPage } from './appointments-page';

describe('AppointmentsPage', () => {
  it('renders days and slots with menus', async () => {
    TestBed.configureTestingModule({
      imports: [AppointmentsPage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(AppointmentsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('امروز');
    expect(el.textContent).toContain('تعطیل کردن کل روز');
    expect(el.querySelectorAll('[aria-label="اقدامات"]').length).toBeGreaterThan(0);
  }, 10000);

  it('cancels a booking through confirm', async () => {
    TestBed.configureTestingModule({
      imports: [AppointmentsPage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(AppointmentsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
    const gateway = TestBed.inject(APPOINTMENTS_GATEWAY);
    await firstValueFrom(gateway.cancelAppointment('s9'));
    const slots = await firstValueFrom(gateway.getSlots('today'));
    expect(slots.find((slot) => slot.id === 's9')?.status).toBe('empty');
  }, 10000);
});
