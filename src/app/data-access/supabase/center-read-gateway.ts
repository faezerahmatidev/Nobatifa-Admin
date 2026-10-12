import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable, switchMap } from 'rxjs';
import { SUPABASE_CLIENT } from '../../core/backend/supabase-client';
import type { BookingDay, ServiceCenter, SlotStatus, TimeSlot } from '../models';

interface CenterRow {
  id: string;
  code: string;
  name: string;
  address: string | null;
}

interface DayRow {
  id: string;
  weekday: string;
  date: string;
}

interface SlotRow {
  id: string;
  day_id: string;
  time: string;
  status: string;
}

function toStatus(value: string): SlotStatus {
  if (value === 'available' || value === 'closed' || value === 'reserved') {
    return value;
  }
  throw new Error('وضعیت ساعت معتبر نیست');
}

/**
 * Public center-data reads (centers/days/slots are public-read per RLS).
 * This is the complete unblocked data surface: everything owner-scoped
 * (vehicles, appointments, invoices, profiles) returns nothing for an admin
 * until the roles model exists — see docs/admin-requirements.md Q1/Q2.
 */
@Injectable({ providedIn: 'root' })
export class CenterReadGateway {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  searchCenter(code: string): Observable<ServiceCenter> {
    return from(
      this.supabase
        .from('service_centers')
        .select('id, code, name, address')
        .eq('code', code.trim())
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('کد اتوسرویس یافت نشد');
        }
        const row = data as unknown as CenterRow;
        return { id: row.id, code: row.code, name: row.name, address: row.address ?? '' };
      }),
    );
  }

  getDays(centerId: string): Observable<BookingDay[]> {
    return this.requireCenter(centerId).pipe(
      switchMap(() =>
        from(
          this.supabase
            .from('booking_days')
            .select('id, weekday, date')
            .eq('center_id', centerId)
            .order('date'),
        ),
      ),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return ((data ?? []) as unknown as DayRow[]).map((day) => ({
          id: day.id,
          weekday: day.weekday,
          date: day.date,
        }));
      }),
    );
  }

  getSlots(centerId: string, dayId: string): Observable<TimeSlot[]> {
    return this.requireCenter(centerId).pipe(
      switchMap(() =>
        from(
          this.supabase
            .from('booking_days')
            .select('id')
            .eq('id', dayId)
            .eq('center_id', centerId)
            .maybeSingle(),
        ),
      ),
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('روز انتخاب‌شده معتبر نیست');
        }
        return from(
          this.supabase
            .from('time_slots')
            .select('id, day_id, time, status')
            .eq('day_id', dayId)
            .order('time'),
        );
      }),
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return ((data ?? []) as unknown as SlotRow[]).map((slot) => ({
          id: slot.id,
          date: '',
          time: slot.time,
          status: toStatus(slot.status),
        }));
      }),
    );
  }

  private requireCenter(centerId: string): Observable<CenterRow> {
    return from(
      this.supabase
        .from('service_centers')
        .select('id, code, name, address')
        .eq('id', centerId)
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('اتوسرویس یافت نشد');
        }
        return data as unknown as CenterRow;
      }),
    );
  }
}
