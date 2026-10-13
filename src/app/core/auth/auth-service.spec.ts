import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MOCK_AUTH_PROVIDER } from '../../data-access/mock/mock-auth-gateway';
import { AuthService, toE164 } from './auth-service';

describe('toE164', () => {
  it('maps iranian mobiles', () => {
    expect(toE164('09123456789')).toBe('+989123456789');
    expect(() => toE164('123')).toThrow('شماره موبایل معتبر نیست');
  });
});

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuthService, MOCK_AUTH_PROVIDER] });
  });

  it('logs in with demo credentials', async () => {
    const service = TestBed.inject(AuthService);
    const user = await firstValueFrom(service.login('09123456789', 'admin1234'));
    expect(user.mobile).toBe('09123456789');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('rejects wrong passwords', async () => {
    const service = TestBed.inject(AuthService);
    await expect(firstValueFrom(service.login('09123456789', 'wrong'))).rejects.toThrow(
      'اطلاعات ورود نادرست است',
    );
    expect(service.isLoggedIn()).toBe(false);
  });

  it('restores the session on init and clears it on logout', async () => {
    const service = TestBed.inject(AuthService);
    await firstValueFrom(service.login('09123456789', 'admin1234'));
    const fresh = TestBed.inject(AuthService);
    await fresh.init();
    expect(fresh.isLoggedIn()).toBe(true);
    await fresh.logout();
    expect(fresh.isLoggedIn()).toBe(false);
  });
});
