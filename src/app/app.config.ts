import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth-service';
import { MOCK_AUTH_PROVIDER } from './data-access/mock/mock-auth-gateway';
import { provideMockAdminAccess } from './data-access/mock/provide-mock-admin-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    MOCK_AUTH_PROVIDER,
    ...provideMockAdminAccess(),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.init();
    }),
  ]
};
