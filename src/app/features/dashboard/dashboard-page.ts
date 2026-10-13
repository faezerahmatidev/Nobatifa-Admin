import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AdminSlot } from '../../data-access/admin-models';
import { DASHBOARD_GATEWAY } from '../../data-access/ports/dashboard-gateway';
import { Banner } from '../../shared/ui/banner/banner';
import { Button } from '../../shared/ui/button/button';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, Banner, Button, EmptyState, ErrorState, Icon, LoadingState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-4 flex justify-end">
      <a routerLink="/dashboard/register">
        <app-button variant="accent">
          ثبت مشتری
          <span class="flex size-5 items-center justify-center rounded-md border border-current">
            <app-icon name="plus" [size]="12" />
          </span>
        </app-button>
      </a>
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
  `,
})
export class DashboardPage implements OnInit {
  private readonly gateway = inject(DASHBOARD_GATEWAY);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly slots = signal<AdminSlot[]>([]);

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
}
