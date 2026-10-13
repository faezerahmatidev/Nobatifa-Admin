import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminDay, AdminSlot } from '../admin-models';

export interface AppointmentsGateway {
  getDays(): Observable<AdminDay[]>;
  getSlots(dayId: string): Observable<AdminSlot[]>;
  setSlotClosed(slotId: string, closed: boolean): Observable<void>;
  cancelAppointment(slotId: string): Observable<void>;
  closeDay(dayId: string): Observable<void>;
}

export const APPOINTMENTS_GATEWAY = new InjectionToken<AppointmentsGateway>(
  'AppointmentsGateway',
);
