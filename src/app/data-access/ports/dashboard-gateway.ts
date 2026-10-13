import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminDay, AdminSlot } from '../admin-models';

export interface DashboardGateway {
  getDays(): Observable<AdminDay[]>;
  getTodaySlots(): Observable<AdminSlot[]>;
}

export const DASHBOARD_GATEWAY = new InjectionToken<DashboardGateway>('DashboardGateway');
