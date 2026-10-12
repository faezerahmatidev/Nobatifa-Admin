import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import { CenterReadGateway } from './center-read-gateway';

interface Result {
  data: unknown;
  error: { message: string } | null;
}

function setup(respond: (table: string) => Result): CenterReadGateway {
  const chain = (table: string) => {
    const q = {
      select: () => q,
      eq: () => q,
      order: () => q,
      then: (resolve: (value: Result) => void) =>
        Promise.resolve(respond(table)).then(resolve),
      single: () => Promise.resolve(respond(table)),
      maybeSingle: () => Promise.resolve(respond(table)),
    };
    return q;
  };
  TestBed.configureTestingModule({
    providers: [
      CenterReadGateway,
      {
        provide: SUPABASE_CLIENT,
        useValue: { from: (table: string) => chain(table) } as unknown as SupabaseClient,
      },
    ],
  });
  return TestBed.inject(CenterReadGateway);
}

const CENTER = { id: 'c1', code: '1001', name: 'اتوسرویس محمد', address: 'x' };

describe('CenterReadGateway', () => {
  it('finds centers, days and slots', async () => {
    const gateway = setup((table) => {
      if (table === 'booking_days') {
        return { data: [{ id: 'd1', weekday: 'یکشنبه', date: '01/11' }], error: null };
      }
      if (table === 'time_slots') {
        return {
          data: [{ id: 's1', day_id: 'd1', time: '13:20', status: 'available' }],
          error: null,
        };
      }
      return { data: CENTER, error: null };
    });
    await expect(firstValueFrom(gateway.searchCenter('1001'))).resolves.toEqual({
      id: 'c1',
      code: '1001',
      name: 'اتوسرویس محمد',
      address: 'x',
    });
    await expect(firstValueFrom(gateway.getDays('c1'))).resolves.toEqual([
      { id: 'd1', weekday: 'یکشنبه', date: '01/11' },
    ]);
    await expect(firstValueFrom(gateway.getSlots('c1', 'd1'))).resolves.toEqual([
      { id: 's1', date: '', time: '13:20', status: 'available' },
    ]);
  });

  it('reports unknown centers', async () => {
    const gateway = setup(() => ({ data: null, error: null }));
    await expect(firstValueFrom(gateway.searchCenter('0000'))).rejects.toThrow(
      'کد اتوسرویس یافت نشد',
    );
    await expect(firstValueFrom(gateway.getDays('nope'))).rejects.toThrow('اتوسرویس یافت نشد');
  });

  it('reports unknown days', async () => {
    const gateway = setup((table) =>
      table === 'booking_days' ? { data: null, error: null } : { data: CENTER, error: null },
    );
    await expect(firstValueFrom(gateway.getSlots('c1', 'nope'))).rejects.toThrow(
      'روز انتخاب‌شده معتبر نیست',
    );
  });

  it('rejects unknown slot statuses', async () => {
    const gateway = setup((table) =>
      table === 'time_slots'
        ? { data: [{ id: 's1', day_id: 'd1', time: '13:20', status: 'weird' }], error: null }
        : { data: CENTER, error: null },
    );
    await expect(firstValueFrom(gateway.getSlots('c1', 'd1'))).rejects.toThrow(
      'وضعیت ساعت معتبر نیست',
    );
  });
});
