import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { fail, MockAdminDatabase, respond } from './mock-admin-database';
import type {
  AdminDay,
  AdminInvoice,
  AdminInvoiceSummary,
  AdminSlot,
} from '../admin-models';
import type {
  CustomerCar,
  NewCar,
  RegistrationData,
} from '../ports/customer-registration-gateway';
import {
  CUSTOMER_REGISTRATION_GATEWAY,
  type CustomerRegistrationGateway,
} from '../ports/customer-registration-gateway';
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
      mileageKm: 30000,
      nextMileageKm: 36000,
      oilType: 'سوپر پایا 10W40',
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

  updateMobile(mobile: string): Observable<void> {
    if (!/^09\d{9}$/.test(mobile.trim())) {
      return fail('شماره موبایل معتبر نیست');
    }
    this.profile.mobile = mobile.trim();
    return respond(undefined);
  }

  changePassword(current: string, next: string): Observable<void> {
    if (!current || next.trim().length < 4) {
      return fail('رمز عبور جدید باید حداقل ۴ رقم باشد');
    }
    return respond(undefined);
  }
}

export const MOCK_PROFILE_PROVIDER = { provide: PROFILE_GATEWAY, useClass: MockProfileGateway };

let carSeq = 0;

@Injectable()
export class MockCustomerRegistrationGateway implements CustomerRegistrationGateway {
  private readonly cars = new Map<string, CustomerCar[]>();

  sendOtp(mobile: string): Observable<void> {
    if (!/^09\d{9}$/.test(mobile.trim())) {
      return fail('شماره موبایل معتبر نیست');
    }
    return respond(undefined);
  }

  verifyOtp(mobile: string, code: string): Observable<{ isNew: boolean }> {
    if (!/^09\d{9}$/.test(mobile.trim())) {
      return fail('شماره موبایل معتبر نیست');
    }
    if (code.trim() !== '1234') {
      return fail('کد تایید نادرست است');
    }
    return respond({ isNew: mobile.trim() !== '09128573449' });
  }

  getCars(mobile: string): Observable<CustomerCar[]> {
    const key = mobile.trim();
    if (!this.cars.has(key)) {
      this.cars.set(
        key,
        key === '09128573449'
          ? [
              { id: 'cc-1', type: 'پراید', plate: '45 س 365 11' },
              { id: 'cc-2', type: 'پراید', plate: '45 س 365 11' },
              { id: 'cc-3', type: 'پراید', plate: '45 س 365 11' },
              { id: 'cc-4', type: 'پراید', plate: '45 س 365 11' },
            ]
          : [],
      );
    }
    return respond([...(this.cars.get(key) ?? [])]);
  }

  addCar(mobile: string, car: NewCar): Observable<CustomerCar> {
    if (!car.type.trim() || !car.plate.trim()) {
      return fail('اطلاعات خودرو کامل نیست');
    }
    carSeq += 1;
    const created: CustomerCar = { id: `cc-new-${carSeq}`, type: car.type.trim(), plate: car.plate.trim() };
    const key = mobile.trim();
    this.cars.set(key, [...(this.cars.get(key) ?? []), created]);
    return respond(created);
  }

  submit(data: RegistrationData): Observable<AdminInvoice> {
    const items = data.services.map((service) => ({
      title: service.title,
      amountRial: service.priceRial,
    }));
    const total = items.reduce((sum, item) => sum + item.amountRial, 0);
    const first = data.services[0];
    return respond({
      id: `inv-reg-${Date.now()}`,
      customerName: `${data.firstName} ${data.lastName}`,
      dateTime: '1403/05/10 - 14:25',
      amountRial: total,
      mobile: data.mobile,
      carType: data.car.type,
      plate: data.car.plate,
      trackingCode: '000085752257',
      serviceCenterName: 'اتوسرویس محمد',
      items,
      mileageKm: toLatinNumber(first?.kilometers) || 30000,
      nextMileageKm: toLatinNumber(first?.nextKilometers) || 36000,
      oilType: first?.oilType?.trim() || 'سوپر پایا 10W40',
    });
  }
}

function toLatinNumber(value: string | undefined): number {
  const latin = (value ?? '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/\D/g, '');
  return latin ? Number(latin) : 0;
}

export const MOCK_CUSTOMER_REGISTRATION_PROVIDER = {
  provide: CUSTOMER_REGISTRATION_GATEWAY,
  useClass: MockCustomerRegistrationGateway,
};
