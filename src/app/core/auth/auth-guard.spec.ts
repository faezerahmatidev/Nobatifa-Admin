import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MOCK_AUTH_PROVIDER } from '../../data-access/mock/mock-auth-gateway';
import { authGuard } from './auth-guard';
import { AuthService } from './auth-service';

@Component({ template: '' })
class Dummy {}

function setup(): Router {
  TestBed.configureTestingModule({
    imports: [],
    providers: [
      AuthService,
      MOCK_AUTH_PROVIDER,
      provideRouter([
        { path: 'login', component: Dummy },
        { path: '', component: Dummy, canActivate: [authGuard] },
      ]),
    ],
  });
  return TestBed.inject(Router);
}

describe('authGuard', () => {
  it('allows logged-in admins', async () => {
    const router = setup();
    await firstValueFrom(TestBed.inject(AuthService).login('09123456789', 'admin1234'));
    expect(await router.navigate(['/'])).toBe(true);
    expect(router.url).toBe('/');
  });

  it('redirects guests to login', async () => {
    const router = setup();
    await TestBed.inject(AuthService).init();
    expect(await router.navigate(['/'])).toBe(true);
    expect(router.url).toBe('/login');
  });
});
