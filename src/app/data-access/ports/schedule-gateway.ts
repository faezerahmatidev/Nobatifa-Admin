import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { WorkSchedule } from '../admin-models';

export interface ScheduleGateway {
  getSchedule(): Observable<WorkSchedule | null>;
  saveSchedule(schedule: WorkSchedule): Observable<void>;
}

export const SCHEDULE_GATEWAY = new InjectionToken<ScheduleGateway>('ScheduleGateway');
