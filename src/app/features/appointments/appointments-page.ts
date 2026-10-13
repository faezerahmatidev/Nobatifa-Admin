import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AdminDay, AdminSlot } from '../../data-access/admin-models';
import { APPOINTMENTS_GATEWAY } from '../../data-access/ports/appointments-gateway';
import { Button } from '../../shared/ui/button/button';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Modal } from '../../shared/ui/modal/modal';

type ConfirmAction =
  | { kind: 'close-day' }
  | { kind: 'cancel'; slot: AdminSlot }
  | { kind: 'toggle'; slot: AdminSlot };

@Component({
  selector: 'app-appointments-page',
  imports: [Button, EmptyState, ErrorState, Icon, LoadingState, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeMenu()',
    '(document:keydown.escape)': 'closeMenu()',
  },
  template: `
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <h1 class="text-lg font-black text-gray-900">نوبت‌ها</h1>
      <span class="ms-auto"></span>
      <app-button variant="danger" size="sm" (click)="askCloseDay()">
        <app-icon name="lock" [size]="14" />
        تعطیل کردن کل روز
      </app-button>
    </div>

    <div class="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      @for (day of days(); track day.id) {
        <button
          type="button"
          (click)="selectDay(day.id)"
          [attr.aria-pressed]="selectedDayId() === day.id"
          [class]="
            'min-w-[84px] shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-bold ' +
            (selectedDayId() === day.id ? 'text-primary-bold underline underline-offset-8' : 'text-gray-600')
          "
        >
          {{ day.label }}
        </button>
      }
    </div>

    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state [message]="error() ?? ''" (retry)="load()" />
    } @else if (slots().length === 0) {
      <app-empty-state title="نوبتی در این روز ثبت نشده است" />
    } @else {
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (slot of slots(); track slot.id) {
          <div
            [class]="
              'relative flex items-center justify-between gap-2 rounded-xl px-4 py-3 ' +
              (slot.status === 'closed'
                ? 'bg-danger-pale'
                : slot.status === 'empty'
                  ? 'bg-gray-200'
                  : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]')
            "
          >
            <p class="text-sm font-bold text-gray-800">{{ slot.time }}</p>
            @if (slot.status === 'booked' && slot.booking; as booking) {
              <p class="text-xs text-gray-600">{{ booking.customerName }}</p>
            }
            @if (slot.status === 'closed') {
              <p class="text-sm font-bold text-gray-700">تعطیل</p>
            } @else if (slot.status === 'empty') {
              <p class="text-sm font-bold text-gray-600">نوبتی ثبت نشده</p>
            }
            <button
              type="button"
              (click)="toggleMenu(slot.id, $event)"
              aria-label="اقدامات"
              class="rounded-lg p-1 text-gray-700"
            >
              <app-icon name="more" [size]="16" />
            </button>
            @if (openMenuId() === slot.id) {
              <div
                role="menu"
                class="absolute left-2 top-full z-10 mt-1 flex min-w-36 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
              >
                @if (slot.status === 'closed') {
                  <button type="button" role="menuitem" (click)="askToggle(slot)" class="flex items-center gap-2 rounded-lg px-3 py-2 text-right text-sm text-gray-800 hover:bg-gray-100">
                    <app-icon name="lock-open" [size]="14" />
                    باز کردن
                  </button>
                }
                @if (slot.status === 'empty') {
                  <button type="button" role="menuitem" (click)="askToggle(slot)" class="flex items-center gap-2 rounded-lg px-3 py-2 text-right text-sm text-gray-800 hover:bg-gray-100">
                    <app-icon name="lock" [size]="14" />
                    تعطیل کردن
                  </button>
                }
                @if (slot.status === 'booked' && slot.booking; as booking) {
                  <button type="button" role="menuitem" (click)="askCancel(slot)" class="flex items-center gap-2 rounded-lg px-3 py-2 text-right text-sm text-gray-800 hover:bg-gray-100">
                    <app-icon name="x" [size]="14" />
                    لغو نوبت
                  </button>
                  <a role="menuitem" href="tel:{{ booking.mobile }}" class="flex items-center gap-2 rounded-lg px-3 py-2 text-right text-sm text-gray-800 hover:bg-gray-100">
                    <app-icon name="phone" [size]="14" />
                    تماس
                  </a>
                }
              </div>
            }
          </div>
        }
      </div>
    }

    <app-modal
      [open]="confirm() !== null"
      title="تأیید عملیات"
      size="sm"
      (closed)="confirm.set(null)"
    >
      <p class="text-center text-sm leading-6 text-gray-700">{{ confirmText() }}</p>
      <div class="mt-4 grid grid-cols-2 gap-2">
        <app-button variant="danger" [fullWidth]="true" (click)="applyConfirm()">
          بله
        </app-button>
        <app-button variant="text" [fullWidth]="true" (click)="confirm.set(null)">
          انصراف
        </app-button>
      </div>
    </app-modal>
  `,
})
export class AppointmentsPage implements OnInit {
  private readonly gateway = inject(APPOINTMENTS_GATEWAY);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly days = signal<AdminDay[]>([]);
  protected readonly slots = signal<AdminSlot[]>([]);
  protected readonly selectedDayId = signal('');
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly confirm = signal<ConfirmAction | null>(null);
  protected readonly busy = signal(false);

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const days = await firstValueFrom(this.gateway.getDays());
      this.days.set(days);
      const selected = days.find((day) => day.active) ?? days[0];
      if (selected) {
        this.selectedDayId.set(selected.id);
        await this.loadSlots(selected.id);
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }

  protected async selectDay(id: string): Promise<void> {
    this.selectedDayId.set(id);
    this.closeMenu();
    await this.loadSlots(id);
  }

  protected toggleMenu(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId.update((open) => (open === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected askCloseDay(): void {
    this.openMenuId.set(null);
    this.confirm.set({ kind: 'close-day' });
  }

  protected askToggle(slot: AdminSlot): void {
    this.openMenuId.set(null);
    this.confirm.set({ kind: 'toggle', slot });
  }

  protected askCancel(slot: AdminSlot): void {
    this.openMenuId.set(null);
    this.confirm.set({ kind: 'cancel', slot });
  }

  protected confirmText(): string {
    const action = this.confirm();
    if (!action) {
      return '';
    }
    if (action.kind === 'close-day') {
      return 'کل روز تعطیل شود؟ نوبت‌های ثبت‌شده حفظ می‌شوند.';
    }
    if (action.kind === 'cancel') {
      return `نوبت ساعت ${action.slot.time} لغو شود؟`;
    }
    return action.slot.status === 'closed'
      ? `ساعت ${action.slot.time} باز شود؟`
      : `ساعت ${action.slot.time} تعطیل شود؟`;
  }

  protected async applyConfirm(): Promise<void> {
    const action = this.confirm();
    if (!action || this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      if (action.kind === 'close-day') {
        await firstValueFrom(this.gateway.closeDay(this.selectedDayId()));
      } else if (action.kind === 'cancel') {
        await firstValueFrom(this.gateway.cancelAppointment(action.slot.id));
      } else {
        await firstValueFrom(
          this.gateway.setSlotClosed(action.slot.id, action.slot.status !== 'closed'),
        );
      }
      this.confirm.set(null);
      await this.loadSlots(this.selectedDayId());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
      this.confirm.set(null);
    } finally {
      this.busy.set(false);
    }
  }

  private async loadSlots(dayId: string): Promise<void> {
    try {
      this.slots.set(await firstValueFrom(this.gateway.getSlots(dayId)));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    }
  }
}
