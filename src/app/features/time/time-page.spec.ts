import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SCHEDULE_GATEWAY } from '../../data-access/ports/schedule-gateway';
import { provideMockAdminAccess } from '../../data-access/mock/provide-mock-admin-access';
import { TimePage } from './time-page';

describe('TimePage', () => {
  it('shows the empty state when no schedule exists', async () => {
    TestBed.configureTestingModule({
      imports: [TimePage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(TimePage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('ایجاد زمان‌بندی');
  }, 10000);

  it('walks the wizard and saves', async () => {
    TestBed.configureTestingModule({
      imports: [TimePage],
      providers: [provideRouter([]), ...provideMockAdminAccess()],
    });
    const fixture = TestBed.createComponent(TimePage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const create = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('ایجاد زمان‌بندی'),
    ) as HTMLButtonElement;
    create.click();
    fixture.detectChanges();
    const day = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('شنبه'),
    ) as HTMLButtonElement;
    day.click();
    fixture.detectChanges();
    const next = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('مرحله بعد'),
    ) as HTMLButtonElement;
    expect(next.disabled).toBe(false);
    const gateway = TestBed.inject(SCHEDULE_GATEWAY);
    await firstValueFrom(
      gateway.saveSchedule({ workingDays: ['شنبه'], startHour: '08:00', endHour: '12:00', disabledRanges: [] }),
    );
    const saved = await firstValueFrom(gateway.getSchedule());
    expect(saved?.workingDays).toEqual(['شنبه']);
  }, 10000);
});
