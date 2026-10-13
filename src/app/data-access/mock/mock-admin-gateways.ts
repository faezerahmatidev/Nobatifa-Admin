import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { fail, MockAdminDatabase, respond } from './mock-admin-database';
import type { AdminDay, AdminInvoice, AdminInvoiceSummary, AdminSlot } from '../admin-models';
import {
  APPOINTMENTS_GATEWAY,
  type AppointmentsGateway,
} from '../ports/appointments-gateway';
import { DASHBOARD_GATEWAY, type DashboardGateway } from '../ports/dashboard-gateway';
import { INVOICES_GATEWAY, type InvoicesGateway } from '../ports/invoices-gateway';
import { PROFILE_GATEWAY, type ProfileGateway } from '../ports/profile-gateway';
import { SCHEDULE_GATEWAY, type ScheduleGateway } from '../ports/schedule-gateway';
import type { WorkSchedule } from '../admin-models';
import { SERVICES_GATEWAY, type ServicesGateway } from '../ports/services-gateway';

const INVOICE_ITEMS = [
  { title: 'تعویض روغن', amountRial: 6500000 },
  { title: 'روغن گیربکس', amountRial: 1500000 },
  { title: 'روغن دیفرانسیل', amountRial: 3000000 },
];

function invoiceSummary(index: number): AdminInvoiceSummary {
  return {
    id: `inv-${index}`,
    customerName: 'فائزه رحمتی',
    dateTime: '1403/05/10 - 14:25',
    amountRial: 3000000,
  };
}

@Injectable()
export class MockDashboardGateway implements DashboardGateway {
  private readonly db = inject(MockAdminDatabase);

  getDays(): Observable<AdminDay[]> {
    return respond(this.db.days.map((day) => ({ ...day })));
  }

  getTodaySlots(): Observable<AdminSlot[]> {
    return respond(this.db.slots.map((slot) => ({ ...slot, booking: slot.booking ? { ...slot.booking } : null })));
  }
}

export const MOCK_DASHBOARD_PROVIDER = { provide: DASHBOARD_GATEWAY, useClass: MockDashboardGateway };

@Injectable()
export class MockAppointmentsGateway implements AppointmentsGateway {
  private readonly db = inject(MockAdminDatabase);

  getDays() {
    return respond(this.db.days.map((day) => ({ ...day })));
  }

  getSlots() {
    return respond(
      this.db.slots.map((slot) => ({ ...slot, booking: slot.booking ? { ...slot.booking } : null })),
    );
  }

  setSlotClosed(slotId: string, closed: boolean): Observable<void> {
    const slot = this.db.slots.find((item) => item.id === slotId);
    if (!slot) {
      return fail('ساعت یافت نشد');
    }
    slot.status = closed ? 'closed' : 'empty';
    if (closed) {
      slot.booking = null;
    }
    return respond(undefined);
  }

  cancelAppointment(slotId: string): Observable<void> {
    const slot = this.db.slots.find((item) => item.id === slotId);
    if (!slot || slot.status !== 'booked') {
      return fail('نوبت فعالی یافت نشد');
    }
    slot.status = 'empty';
    slot.booking = null;
    return respond(undefined);
  }

  closeDay(): Observable<void> {
    for (const slot of this.db.slots) {
      if (slot.status !== 'booked') {
        slot.status = 'closed';
        slot.booking = null;
      }
    }
    return respond(undefined);
  }

  registerWalkIn(
    slotId: string,
    customer: { name: string; mobile: string },
  ): Observable<void> {
    const slot = this.db.slots.find((item) => item.id === slotId);
    if (!slot || slot.status !== 'empty') {
      return fail('این ساعت قابل رزرو نیست');
    }
    if (!customer.name.trim() || !/^09\d{9}$/.test(customer.mobile.trim())) {
      return fail('اطلاعات مشتری کامل نیست');
    }
    slot.status = 'booked';
    slot.booking = {
      customerName: customer.name.trim(),
      mobile: customer.mobile.trim(),
      carType: '—',
      plate: '—',
    };
    return respond(undefined);
  }
}

export const MOCK_APPOINTMENTS_PROVIDER = {
  provide: APPOINTMENTS_GATEWAY,
  useClass: MockAppointmentsGateway,
};

@Injectable()
export class MockScheduleGateway implements ScheduleGateway {
  private readonly db = inject(MockAdminDatabase);

  getSchedule(): Observable<WorkSchedule | null> {
    const schedule = this.db.schedule;
    return respond(
      schedule ? { ...schedule, disabledRanges: [] } : null,
    );
  }

  saveSchedule(schedule: WorkSchedule): Observable<void> {
    this.db.schedule = {
      workingDays: [...schedule.workingDays],
      startHour: schedule.startHour,
      endHour: schedule.endHour,
    };
    return respond(undefined);
  }
}

export const MOCK_SCHEDULE_PROVIDER = { provide: SCHEDULE_GATEWAY, useClass: MockScheduleGateway };

@Injectable()
export class MockServicesGateway implements ServicesGateway {
  private readonly db = inject(MockAdminDatabase);

  list() {
    return respond(this.db.services.map((service) => ({ ...service })));
  }

  setEnabled(id: string, enabled: boolean): Observable<void> {
    const service = this.db.services.find((item) => item.id === id);
    if (!service) {
      return fail('خدمت یافت نشد');
    }
    service.enabled = enabled;
    return respond(undefined);
  }
}

export const MOCK_SERVICES_PROVIDER = { provide: SERVICES_GATEWAY, useClass: MockServicesGateway };

@Injectable()
export class MockInvoicesGateway implements InvoicesGateway {
  list(page: number) {
    if (page < 1 || page > 10) {
      return fail('صفحه نامعتبر است');
    }
    const items = Array.from({ length: 7 }, (_, index) => invoiceSummary(index + 1));
    return respond({ items, totalPages: 10 });
  }

  getById(id: string): Observable<AdminInvoice> {
    return respond({
      ...invoiceSummary(1),
      id,
      mobile: '09128573449',
      carType: 'پراید',
      plate: '45 س 365 11',
      trackingCode: '000085752257',
      serviceCenterName: 'اتوسرویس محمد',
      items: INVOICE_ITEMS,
    });
  }
}

export const MOCK_INVOICES_PROVIDER = { provide: INVOICES_GATEWAY, useClass: MockInvoicesGateway };

@Injectable()
export class MockProfileGateway implements ProfileGateway {
  private profile = {
    centerName: 'اتوسرویس محمد',
    centerCode: '09128573449',
    firstName: 'محمد',
    lastName: 'پشتیبان',
    mobile: '09128573449',
  };

  getProfile() {
    return respond({ ...this.profile });
  }

  updateNames(firstName: string, lastName: string): Observable<void> {
    if (!firstName.trim() || !lastName.trim()) {
      return fail('نام و نام خانوادگی الزامی است');
    }
    this.profile.firstName = firstName.trim();
    this.profile.lastName = lastName.trim();
    return respond(undefined);
  }
}

export const MOCK_PROFILE_PROVIDER = { provide: PROFILE_GATEWAY, useClass: MockProfileGateway };
