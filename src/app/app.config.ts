import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { SUPABASE_CLIENT_PROVIDER } from './core/backend/supabase-client';
import { AuthService } from './core/auth/auth-service';
import { provideMockAdminAccess } from './data-access/mock/provide-mock-admin-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    SUPABASE_CLIENT_PROVIDER,
    ...provideMockAdminAccess(),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.init();
    }),
  ]
};
