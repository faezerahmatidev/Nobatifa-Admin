/**
 * Shared domain models — COPIED READ-ONLY from Nobatifa-Website
 * (src/app/data-access/models.ts) on 2026-10-12.
 * The website owns these definitions; admin changes that need schema
 * evolution go through shared migrations, then this copy is refreshed.
 */

export type SlotStatus = 'available' | 'closed' | 'reserved';

export type AppointmentStatus = 'pending' | 'done' | 'cancelled';

export interface User {
  readonly id: string;
  firstName: string;
  lastName: string;
  /** Iranian mobile number, e.g. 09128567349 */
  mobile: string;
}

/** Iranian plate: e.g. 11 365 س 45 */
export interface PlateNumber {
  part1: string;
  part2: string;
  letter: string;
  iranCode: string;
}

export interface Vehicle {
  readonly id: string;
  type: string;
  plate: PlateNumber;
}

export interface ServiceCenter {
  readonly id: string;
  code: string;
  name: string;
  address: string;
}

export interface TimeSlot {
  readonly id: string;
  date: string;
  time: string;
  status: SlotStatus;
}

export interface BookingDay {
  readonly id: string;
  weekday: string;
  date: string;
}

export interface Appointment {
  readonly id: string;
  serviceCenter: ServiceCenter;
  date: string;
  time: string;
  vehicle: Vehicle;
  status: AppointmentStatus;
}

export interface InvoiceItem {
  title: string;
  amountRial: number;
}

export interface Invoice {
  readonly id: string;
  readonly appointmentId: string;
  trackingCode: string;
  customer: Pick<User, 'firstName' | 'lastName' | 'mobile'>;
  vehicle: Vehicle;
  serviceCenterName: string;
  dateTime: string;
  items: readonly InvoiceItem[];
  totalRial: number;
  mileageKm: number;
  nextMileageKm: number;
  oilType: string;
}

/** Frontend-only mock session. NOT a security boundary. */
export interface AuthSession {
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
