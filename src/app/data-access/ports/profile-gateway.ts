import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { StaffProfile } from '../admin-models';

export interface ProfileGateway {
  getProfile(): Observable<StaffProfile>;
  updateNames(firstName: string, lastName: string): Observable<void>;
  updateMobile(mobile: string): Observable<void>;
  changePassword(current: string, next: string): Observable<void>;
}

export const PROFILE_GATEWAY = new InjectionToken<ProfileGateway>('ProfileGateway');
