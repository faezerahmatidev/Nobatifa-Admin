import { Injectable } from '@angular/core';
import { delay, of, throwError, type Observable } from 'rxjs';
import type { AdminDay, AdminSlot, ServiceItem } from '../admin-models';

export const MOCK_LATENCY_MS = 150;

const BOOKING = {
  customerName: 'علیرضا رمضانی',
  mobile: '09128573449',
  carType: 'پراید',
  plate: '45 س 365 11',
};

function slot(id: string, time: string, status: AdminSlot['status'], booked: boolean): AdminSlot {
  return { id, time, status, booking: booked ? { ...BOOKING } : null };
}

export const MOCK_DAYS: AdminDay[] = [
  { id: 'today', label: 'امروز', active: true },
  { id: 'tomorrow', label: 'فردا', active: false },
  { id: 'd3', label: 'شنبه ۲۴ آذر', active: false },
  { id: 'd4', label: 'یکشنبه ۲۵ آذر', active: false },
  { id: 'd5', label: 'دوشنبه ۲۶ آذر', active: false },
  { id: 'd6', label: 'سه‌شنبه ۲۷ آذر', active: false },
  { id: 'd7', label: 'چهارشنبه ۲۸ آذر', active: false },
  { id: 'd8', label: 'پنجشنبه ۲۹ آذر', active: false },
  { id: 'd9', label: 'جمعه ۳۰ آذر', active: false },
  { id: 'd10', label: 'شنبه ۱ دی', active: false },
  { id: 'd11', label: 'یکشنبه ۲ دی', active: false },
];

export const MOCK_SLOTS: AdminSlot[] = [
  slot('s1', '11:20', 'closed', false),
  slot('s2', '11:20', 'closed', false),
  slot('s3', '11:20', 'closed', false),
  slot('s4', '11:20', 'empty', false),
  slot('s5', '11:20', 'empty', false),
  slot('s6', '11:20', 'empty', false),
  slot('s7', '11:20', 'empty', false),
  slot('s8', '11:20', 'empty', false),
  slot('s9', '10:40', 'booked', true),
  slot('s10', '10:40', 'booked', true),
  slot('s11', '10:40', 'booked', true),
  slot('s12', '10:40', 'booked', true),
];

export const MOCK_SERVICES: ServiceItem[] = [
  { id: 'oil', title: 'تعویض روغن', enabled: true },
  { id: 'gearbox-oil', title: 'روغن گیربکس', enabled: true },
  { id: 'diff-oil', title: 'روغن دیفرانسیل', enabled: true },
  { id: 'filter', title: 'تعویض فیلتر', enabled: false },
  { id: 'steering', title: 'روغن فرمان', enabled: false },
  { id: 'gearbox-work', title: 'گیربکس‌کاری', enabled: false },
  { id: 'battery', title: 'آب باطری', enabled: false },
  { id: 'tire', title: 'تنظیم باد چرخ', enabled: false },
];

export function respond<T>(value: T): Observable<T> {
  return of(value).pipe(delay(MOCK_LATENCY_MS));
}

export function fail(message: string): Observable<never> {
  return throwError(() => new Error(message)).pipe(delay(MOCK_LATENCY_MS));
}

@Injectable({ providedIn: 'root' })
export class MockAdminDatabase {
  days = structuredClone(MOCK_DAYS);
  slots = structuredClone(MOCK_SLOTS);
  services = structuredClone(MOCK_SERVICES);
  schedule: { workingDays: string[]; startHour: string; endHour: string } | null = null;
}
