import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { APPOINTMENTS_GATEWAY, type AppointmentsGateway } from '../ports/appointments-gateway';
import { SERVICES_GATEWAY, type ServicesGateway } from '../ports/services-gateway';
import { INVOICES_GATEWAY, type InvoicesGateway } from '../ports/invoices-gateway';
import {
  MOCK_APPOINTMENTS_PROVIDER,
  MOCK_INVOICES_PROVIDER,
  MOCK_SERVICES_PROVIDER,
} from './mock-admin-gateways';
import { MockAdminDatabase } from './mock-admin-database';

describe('Mock admin gateways', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MOCK_APPOINTMENTS_PROVIDER, MOCK_INVOICES_PROVIDER, MOCK_SERVICES_PROVIDER],
    });
  });

  it('toggles slot states and cancels bookings', async () => {
    const gateway = TestBed.inject(APPOINTMENTS_GATEWAY) as AppointmentsGateway;
    const db = TestBed.inject(MockAdminDatabase);
    await firstValueFrom(gateway.setSlotClosed('s4', true));
    expect(db.slots.find((slot) => slot.id === 's4')?.status).toBe('closed');
    await firstValueFrom(gateway.cancelAppointment('s9'));
    expect(db.slots.find((slot) => slot.id === 's9')?.status).toBe('empty');
    await expect(firstValueFrom(gateway.cancelAppointment('s4'))).rejects.toThrow(
      'نوبت فعالی یافت نشد',
    );
  });

  it('toggles services', async () => {
    const gateway = TestBed.inject(SERVICES_GATEWAY) as ServicesGateway;
    await firstValueFrom(gateway.setEnabled('filter', true));
    const list = await firstValueFrom(gateway.list());
    expect(list.find((service) => service.id === 'filter')?.enabled).toBe(true);
    await expect(firstValueFrom(gateway.setEnabled('nope', true))).rejects.toThrow(
      'خدمت یافت نشد',
    );
  });

  it('pages invoices', async () => {
    const gateway = TestBed.inject(INVOICES_GATEWAY) as InvoicesGateway;
    const page = await firstValueFrom(gateway.list(1));
    expect(page.items.length).toBe(7);
    expect(page.totalPages).toBe(10);
    await expect(firstValueFrom(gateway.list(11))).rejects.toThrow('صفحه نامعتبر است');
  });
});
