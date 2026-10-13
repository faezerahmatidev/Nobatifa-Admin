import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminInvoice, AdminInvoiceSummary } from '../admin-models';

export interface InvoicesGateway {
  list(page: number): Observable<{ items: AdminInvoiceSummary[]; totalPages: number }>;
  getById(id: string): Observable<AdminInvoice>;
}

export const INVOICES_GATEWAY = new InjectionToken<InvoicesGateway>('InvoicesGateway');
