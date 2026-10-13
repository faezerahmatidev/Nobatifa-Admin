import type { Provider } from '@angular/core';
import { MOCK_APPOINTMENTS_PROVIDER } from './mock-admin-gateways';
import { MOCK_CUSTOMER_REGISTRATION_PROVIDER } from './mock-admin-gateways';
import { MOCK_DASHBOARD_PROVIDER } from './mock-admin-gateways';
import { MOCK_INVOICES_PROVIDER } from './mock-admin-gateways';
import { MOCK_PROFILE_PROVIDER } from './mock-admin-gateways';
import { MOCK_SCHEDULE_PROVIDER } from './mock-admin-gateways';
import { MOCK_SERVICES_PROVIDER } from './mock-admin-gateways';

/** Mock admin backend (Figma fixtures + latency). UI depends on ports only. */
export function provideMockAdminAccess(): Provider[] {
  return [
    MOCK_APPOINTMENTS_PROVIDER,
    MOCK_CUSTOMER_REGISTRATION_PROVIDER,
    MOCK_DASHBOARD_PROVIDER,
    MOCK_INVOICES_PROVIDER,
    MOCK_PROFILE_PROVIDER,
    MOCK_SCHEDULE_PROVIDER,
    MOCK_SERVICES_PROVIDER,
  ];
}
