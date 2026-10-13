import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { WorkSchedule } from '../../data-access/admin-models';
import { SCHEDULE_GATEWAY } from '../../data-access/ports/schedule-gateway';
import { Banner } from '../../shared/ui/banner/banner';
import { Button } from '../../shared/ui/button/button';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';

const WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const STEP_LABELS = ['روزهای کاری هفته', 'بازه‌های زمانی کاری', 'روزهای تعطیل'];

function hourOptions(): string[] {
  const options: string[] = [];
  for (let hour = 6; hour <= 22; hour += 1) {
    options.push(`${hour}:00`);
  }
  return options;
}

function expandRanges(start: string, end: string): string[] {
  const toMinutes = (value: string): number => {
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
  };
  const format = (minutes: number): string =>
    `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
  const ranges: string[] = [];
  for (let from = toMinutes(start); from + 40 <= toMinutes(end); from += 40) {
    ranges.push(`${format(from)} - ${format(from + 40)}`);
  }
  return ranges;
}

@Component({
  selector: 'app-time-page',
  imports: [Banner, Button, ErrorState, Icon, LoadingState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <h1 class="text-lg font-black text-gray-900">مدیریت زمان</h1>
      <span class="ms-auto"></span>
      @if (!editing() && schedule()) {
        <app-button variant="accent" size="sm" (click)="startEdit()">
          ویرایش زمان‌بندی
          <app-icon name="pencil" [size]="14" />
        </app-button>
      }
    </div>

    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state [message]="error() ?? ''" (retry)="load()" />
    } @else if (editing()) {
      <div class="mb-2 flex items-center justify-center gap-0" aria-hidden="true">
        @for (label of stepLabels; track $index) {
          <span
            [class]="
              'size-4 rounded-full border-2 ' +
              ($index < step()
                ? 'border-success-deep bg-success-deep'
                : $index === step()
                  ? 'border-primary-base bg-primary-base'
                  : 'border-gray-300 bg-gray-200')
            "
          ></span>
          @if ($index < stepLabels.length - 1) {
            <span
              [class]="
                'h-0.5 w-16 sm:w-24 ' + ($index < step() ? 'bg-success-deep' : 'bg-gray-200')
              "
            ></span>
          }
        }
      </div>
      <p class="mb-4 text-center text-sm font-bold text-gray-800">{{ stepLabels[step()] }}</p>

      @if (step() === 0) {
        <app-banner
          text="از میان روزهای هفته، روزهای کاری خود را انتخاب کنید سپس به مرحله بعد بروید."
          class="mb-4 block"
        />
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (day of weekdays; track day) {
            <button
              type="button"
              (click)="toggleDay(day)"
              [attr.aria-pressed]="selectedDays().includes(day)"
              class="flex h-12 items-center justify-between rounded-xl border bg-white px-4 text-sm text-gray-800"
              [class.border-primary-base]="selectedDays().includes(day)"
              [class.border-gray-300]="!selectedDays().includes(day)"
            >
              {{ day }}
              <span
                [class]="
                  'flex size-5 items-center justify-center rounded-md border ' +
                  (selectedDays().includes(day)
                    ? 'border-primary-base bg-primary-base text-white'
                    : 'border-gray-300 text-transparent')
                "
              >
                <app-icon name="check" [size]="12" />
              </span>
            </button>
          }
        </div>
      }

      @if (step() === 1) {
        <app-banner
          text="از میان روزهای هفته، روزهای کاری خود را انتخاب کنید سپس به مرحله بعد بروید."
          class="mb-4 block"
        />
        <div class="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1 text-sm font-bold text-gray-800">
            زمان شروع ساعت کاری
            <span class="relative block">
              <select
                [value]="startHour()"
                (change)="startHour.set($any($event.target).value)"
                class="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pl-10 text-sm text-gray-900 outline-none focus:border-primary-base"
              >
                @for (hour of hours; track hour) {
                  <option [value]="hour">{{ hour }}</option>
                }
              </select>
              <app-icon name="clock" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </span>
          </label>
          <label class="flex flex-col gap-1 text-sm font-bold text-gray-800">
            زمان پایان ساعت کاری
            <span class="relative block">
              <select
                [value]="endHour()"
                (change)="endHour.set($any($event.target).value)"
                class="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pl-10 text-sm text-gray-900 outline-none focus:border-primary-base"
              >
                @for (hour of hours; track hour) {
                  <option [value]="hour">{{ hour }}</option>
                }
              </select>
              <app-icon name="clock" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </span>
          </label>
        </div>
        @if (!validHours()) {
          <p class="mt-2 text-center text-xs text-danger-bold" role="alert">
            ساعت پایان باید بعد از ساعت شروع باشد
          </p>
        }
      }

      @if (step() === 2) {
        <app-banner
          tone="warning"
          text="در میان بازه‌های کاری، زیر اگر بازهای تعطیل است آن را مشخص کنید."
          class="mb-4 block"
        />
        @for (day of selectedDays(); track day) {
          <h3 class="mb-2 mt-4 text-center text-sm font-bold text-gray-800">{{ day }}</h3>
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            @for (range of ranges(); track range) {
              <button
                type="button"
                (click)="toggleRange(day, range)"
                [attr.aria-pressed]="isDisabled(day, range)"
                [class]="
                  'h-11 rounded-xl border text-[13px] ' +
                  (isDisabled(day, range)
                    ? 'border-danger-soft bg-danger-pale text-gray-700'
                    : 'border-gray-300 bg-white text-gray-800')
                "
              >
                {{ range }}
              </button>
            }
          </div>
        }
      }

      <div class="mx-auto mt-6 flex max-w-md gap-2">
        @if (step() > 0) {
          <app-button variant="accent" [fullWidth]="true" (click)="step.update((value) => value - 1)">
            مرحله قبل
            <app-icon name="chevron-right" [size]="14" />
          </app-button>
        }
        @if (step() < 2) {
          <app-button [fullWidth]="true" [disabled]="!canNext()" (click)="step.update((value) => value + 1)">
            مرحله بعد
            <app-icon name="chevron-left" [size]="14" />
          </app-button>
        } @else {
          <app-button [fullWidth]="true" [disabled]="saving()" (click)="save()">
            ثبت زمان‌بندی
          </app-button>
        }
      </div>
    } @else if (schedule(); as current) {
      <app-banner
        text="زمان‌بندی زیر برای اتوسرویس تعیین شده است."
        class="mb-4 block"
      />
      @for (day of current.workingDays; track day) {
        <h3 class="mb-2 mt-4 text-center text-sm font-bold text-gray-800">{{ day }}</h3>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          @for (range of rangesFor(current); track range) {
            <p
              [class]="
                'h-11 content-center rounded-xl border text-center text-[13px] ' +
                (isSavedDisabled(current, day, range)
                  ? 'border-danger-soft bg-danger-pale text-gray-700'
                  : 'border-gray-300 bg-white text-gray-800')
              "
            >
              {{ range }}
            </p>
          }
        </div>
      }
    } @else {
      <app-banner
        tone="warning"
        text="در حال حاضر زمان‌بندی برای اتوسرویس تعیین نشده!"
        class="mb-4 block"
      />
      <div class="flex justify-center">
        <app-button variant="accent" (click)="startCreate()">
          ایجاد زمان‌بندی
          <app-icon name="plus" [size]="14" />
        </app-button>
      </div>
    }
  `,
})
export class TimePage implements OnInit {
  private readonly gateway = inject(SCHEDULE_GATEWAY);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly schedule = signal<WorkSchedule | null>(null);
  protected readonly editing = signal(false);
  protected readonly step = signal(0);
  protected readonly selectedDays = signal<string[]>([]);
  protected readonly startHour = signal('08:00');
  protected readonly endHour = signal('12:00');
  protected readonly disabled = signal<Record<string, boolean>>({});

  protected readonly weekdays = WEEKDAYS;
  protected readonly stepLabels = STEP_LABELS;
  protected readonly hours = hourOptions();

  protected ranges(): string[] {
    return expandRanges(this.startHour(), this.endHour());
  }

  protected rangesFor(schedule: WorkSchedule): string[] {
    return expandRanges(schedule.startHour, schedule.endHour);
  }

  protected canNext(): boolean {
    if (this.step() === 0) {
      return this.selectedDays().length > 0;
    }
    return this.validHours();
  }

  protected validHours(): boolean {
    return this.startHour() < this.endHour();
  }

  protected toggleDay(day: string): void {
    this.selectedDays.update((days) =>
      days.includes(day) ? days.filter((item) => item !== day) : [...days, day],
    );
  }

  protected toggleRange(day: string, range: string): void {
    const key = `${day}|${range}`;
    this.disabled.update((map) => ({ ...map, [key]: !map[key] }));
  }

  protected isDisabled(day: string, range: string): boolean {
    return !!this.disabled()[`${day}|${range}`];
  }

  protected isSavedDisabled(schedule: WorkSchedule, day: string, range: string): boolean {
    return schedule.disabledRanges.some((item) => item.day === day && `${item.from} - ${item.to}` === range);
  }

  protected startCreate(): void {
    this.selectedDays.set([]);
    this.disabled.set({});
    this.step.set(0);
    this.editing.set(true);
  }

  protected startEdit(): void {
    const current = this.schedule();
    if (current) {
      this.selectedDays.set([...current.workingDays]);
      this.startHour.set(current.startHour);
      this.endHour.set(current.endHour);
      const map: Record<string, boolean> = {};
      for (const item of current.disabledRanges) {
        map[`${item.day}|${item.from} - ${item.to}`] = true;
      }
      this.disabled.set(map);
    }
    this.step.set(0);
    this.editing.set(true);
  }

  protected async save(): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.saving.set(true);
    try {
      const ranges = this.disabled();
      const disabledRanges = Object.keys(ranges)
        .filter((key) => ranges[key])
        .map((key) => {
          const [day, range] = key.split('|');
          const [from, to] = range.split(' - ');
          return { day, from, to };
        });
      await firstValueFrom(
        this.gateway.saveSchedule({
          workingDays: this.selectedDays(),
          startHour: this.startHour(),
          endHour: this.endHour(),
          disabledRanges,
        }),
      );
      this.editing.set(false);
      await this.load();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.saving.set(false);
    }
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.schedule.set(await firstValueFrom(this.gateway.getSchedule()));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit(): void {
    this.load();
  }
}
