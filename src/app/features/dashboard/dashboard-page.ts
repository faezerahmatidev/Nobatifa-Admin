import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AdminSlot } from '../../data-access/admin-models';
import { APPOINTMENTS_GATEWAY } from '../../data-access/ports/appointments-gateway';
import { DASHBOARD_GATEWAY } from '../../data-access/ports/dashboard-gateway';
import { Banner } from '../../shared/ui/banner/banner';
import { Button } from '../../shared/ui/button/button';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Modal } from '../../shared/ui/modal/modal';

@Component({
  selector: 'app-dashboard-page',
  imports: [ReactiveFormsModule, RouterLink, Banner, Button, EmptyState, ErrorState, Icon, LoadingState, Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-4 flex justify-end">
      <app-button variant="accent" (click)="openWalkIn()">
        ثبت مشتری
        <span class="flex size-5 items-center justify-center rounded-md border border-current">
          <app-icon name="plus" [size]="12" />
        </span>
      </app-button>
    </div>
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <h1 class="text-xl font-black text-gray-900">نوبت‌های امروز</h1>
      <a routerLink="/appointments">
        <app-button>
          مدیریت نوبت‌ها
          <app-icon name="appointments" [size]="14" />
        </app-button>
      </a>
    </div>

    <app-banner
      text="شما می‌توانید با انتخاب نوبت‌های ثبت شده به سادگی مشتری امروز خود را ثبت کنید!"
      class="mb-4 block"
    />

    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state [message]="error() ?? ''" (retry)="load()" />
    } @else if (slots().length === 0) {
      <app-empty-state title="نوبتی برای امروز ثبت نشده است" />
    } @else {
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (slot of slots(); track slot.id) {
          @switch (slot.status) {
            @case ('closed') {
              <p class="rounded-xl bg-danger-pale px-4 py-3 text-center text-sm font-bold text-gray-700">
                {{ slot.time }} تعطیل
              </p>
            }
            @case ('empty') {
              <p class="rounded-xl bg-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-600">
                {{ slot.time }} نوبتی ثبت نشده
              </p>
            }
            @case ('booked') {
              <div class="rounded-xl bg-white px-4 py-3 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                @if (slot.booking; as booking) {
                  <p class="text-sm font-bold text-gray-800">
                    {{ slot.time }} {{ booking.customerName }}
                  </p>
                  <p class="mt-1 text-xs text-gray-600">
                    {{ booking.carType }} {{ booking.plate }}
                  </p>
                }
              </div>
            }
          }
        }
      </div>
    }

    <app-modal
      [open]="walkInOpen()"
      title="ثبت مشتری حضوری"
      size="sm"
      (closed)="walkInOpen.set(false)"
    >
      <p class="mb-3 text-sm font-bold text-gray-800">ساعت خالی را انتخاب کنید</p>
      <div class="mb-4 flex flex-wrap gap-2">
        @for (slot of emptySlots(); track slot.id) {
          <button
            type="button"
            (click)="selectedSlotId.set(slot.id)"
            [attr.aria-pressed]="selectedSlotId() === slot.id"
            [class]="
              'h-10 rounded-xl border px-4 text-sm font-bold ' +
              (selectedSlotId() === slot.id
                ? 'border-primary-base bg-primary-pale text-primary-bold'
                : 'border-gray-300 bg-white text-gray-700')
            "
          >
            {{ slot.time }}
          </button>
        } @empty {
          <p class="text-sm text-gray-500">ساعت خالی وجود ندارد</p>
        }
      </div>
      <form (submit)="$event.preventDefault(); submitWalkIn()" class="flex flex-col gap-3">
        <input
          [formControl]="customerName"
          type="text"
          placeholder="نام و نام خانوادگی"
          aria-label="نام و نام خانوادگی مشتری"
          class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
        />
        <input
          [formControl]="customerMobile"
          type="tel"
          dir="rtl"
          inputmode="tel"
          placeholder="شماره موبایل"
          aria-label="شماره موبایل مشتری"
          class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
        />
        @if (walkInError()) {
          <p role="alert" class="text-center text-xs text-danger-bold">{{ walkInError() }}</p>
        }
        <button
          type="submit"
          [disabled]="saving()"
          class="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-base text-base font-bold text-white transition-colors hover:bg-primary-bold disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          ثبت نوبت
        </button>
      </form>
    </app-modal>
  `,
})
export class DashboardPage implements OnInit {
  private readonly gateway = inject(DASHBOARD_GATEWAY);
  private readonly booking = inject(APPOINTMENTS_GATEWAY);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly slots = signal<AdminSlot[]>([]);
  protected readonly walkInOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly walkInError = signal<string | null>(null);
  protected readonly selectedSlotId = signal<string | null>(null);
  protected readonly customerName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly customerMobile = new FormControl('', {
    validators: [Validators.required, Validators.pattern(/^09\d{9}$/)],
    nonNullable: true,
  });

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.slots.set(await firstValueFrom(this.gateway.getTodaySlots()));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }

  protected emptySlots(): AdminSlot[] {
    return this.slots().filter((slot) => slot.status === 'empty');
  }

  protected openWalkIn(): void {
    this.customerName.setValue('');
    this.customerMobile.setValue('');
    this.selectedSlotId.set(this.emptySlots()[0]?.id ?? null);
    this.walkInError.set(null);
    this.walkInOpen.set(true);
  }

  protected async submitWalkIn(): Promise<void> {
    const slotId = this.selectedSlotId();
    if (this.customerName.invalid || this.customerMobile.invalid || !slotId || this.saving()) {
      this.customerName.markAsTouched();
      this.customerMobile.markAsTouched();
      return;
    }
    this.saving.set(true);
    this.walkInError.set(null);
    try {
      await firstValueFrom(
        this.booking.registerWalkIn(slotId, {
          name: this.customerName.value.trim(),
          mobile: this.customerMobile.value.trim(),
        }),
      );
      this.walkInOpen.set(false);
      await this.load();
    } catch (error) {
      this.walkInError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.saving.set(false);
    }
  }
}
