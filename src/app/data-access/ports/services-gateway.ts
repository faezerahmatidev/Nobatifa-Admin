import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ServiceItem } from '../admin-models';

export interface ServicesGateway {
  list(): Observable<ServiceItem[]>;
  setEnabled(id: string, enabled: boolean): Observable<void>;
}

export const SERVICES_GATEWAY = new InjectionToken<ServicesGateway>('ServicesGateway');
