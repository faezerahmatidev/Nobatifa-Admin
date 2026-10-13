import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminInvoice } from '../admin-models';

export interface CustomerCar {
  readonly id: string;
  type: string;
  plate: string;
}

export interface NewCar {
  type: string;
  plate: string;
}

export interface ServiceDetail {
  serviceId: string;
  title: string;
  kilometers: string;
  nextKilometers: string;
  oilType: string;
  priceRial: number;
}

export interface RegistrationData {
  mobile: string;
  firstName: string;
  lastName: string;
  car: CustomerCar;
  services: ServiceDetail[];
}

export interface CustomerRegistrationGateway {
  sendOtp(mobile: string): Observable<void>;
  verifyOtp(mobile: string, code: string): Observable<{ isNew: boolean }>;
  getCars(mobile: string): Observable<CustomerCar[]>;
  addCar(mobile: string, car: NewCar): Observable<CustomerCar>;
  submit(data: RegistrationData): Observable<AdminInvoice>;
}

export const CUSTOMER_REGISTRATION_GATEWAY = new InjectionToken<CustomerRegistrationGateway>(
  'CustomerRegistrationGateway',
);
