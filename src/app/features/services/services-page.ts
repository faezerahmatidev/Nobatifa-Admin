import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { ServiceItem } from '../../data-access/admin-models';
import { SERVICES_GATEWAY } from '../../data-access/ports/services-gateway';
import { Banner } from '../../shared/ui/banner/banner';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Switch } from '../../shared/ui/switch/switch';

@Component({
  selector: 'app-services-page',
  imports: [Banner, EmptyState, ErrorState, LoadingState, Switch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-4 text-lg font-black text-gray-900">مدیریت خدمات</h1>

    <app-banner
      text="از میان خدمات زیر، مواردی را که توسط اتوسرویس ارائه می‌شوند انتخاب کنید و باقی را غیرفعال کنید."
      class="mb-4 block"
    />

    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state [message]="error() ?? ''" (retry)="load()" />
    } @else if (services().length === 0) {
      <app-empty-state title="خدمتی ثبت نشده است" />
    } @else {
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (service of services(); track service.id) {
          <div
            [class]="
              'flex h-12 items-center justify-between rounded-xl border bg-white px-4 text-sm text-gray-800 ' +
              (service.enabled ? 'border-primary-soft' : 'border-gray-300')
            "
          >
            {{ service.title }}
            <app-switch
              [label]="service.title"
              [checked]="service.enabled"
              (checkedChange)="toggle(service, $event)"
            />
          </div>
        }
      </div>
    }
  `,
})
export class ServicesPage implements OnInit {
  private readonly gateway = inject(SERVICES_GATEWAY);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly services = signal<ServiceItem[]>([]);

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.services.set(await firstValueFrom(this.gateway.list()));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }

  protected async toggle(service: ServiceItem, enabled: boolean): Promise<void> {
    const previous = this.services();
    this.services.set(previous.map((item) => (item.id === service.id ? { ...item, enabled } : item)));
    try {
      await firstValueFrom(this.gateway.setEnabled(service.id, enabled));
    } catch (error) {
      this.services.set(previous);
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    }
  }
}
