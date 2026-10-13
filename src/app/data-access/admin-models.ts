/** Admin domain models — derived from dashborad-admin Figma screens. */

export type AdminSlotStatus = 'empty' | 'booked' | 'closed';

export interface AdminBooking {
  customerName: string;
  mobile: string;
  carType: string;
  plate: string;
}

export interface AdminSlot {
  readonly id: string;
  time: string;
  status: AdminSlotStatus;
  booking: AdminBooking | null;
}

export interface AdminDay {
  readonly id: string;
  label: string;
  active: boolean;
}

export interface ServiceItem {
  readonly id: string;
  title: string;
  enabled: boolean;
}

export interface AdminInvoiceSummary {
  readonly id: string;
  customerName: string;
  dateTime: string;
  amountRial: number;
}

export interface AdminInvoice extends AdminInvoiceSummary {
  mobile: string;
  carType: string;
  plate: string;
  trackingCode: string;
  serviceCenterName: string;
  items: readonly { title: string; amountRial: number }[];
}

export interface WorkSchedule {
  workingDays: string[];
  startHour: string;
  endHour: string;
  disabledRanges: readonly { day: string; from: string; to: string }[];
}

export interface StaffProfile {
  centerName: string;
  centerCode: string;
  firstName: string;
  lastName: string;
  mobile: string;
}
