import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AdminInvoice } from '../../data-access/admin-models';
import { INVOICES_GATEWAY } from '../../data-access/ports/invoices-gateway';
import { Button } from '../../shared/ui/button/button';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { toFaDigits } from '../../shared/utils/fa-digits';

@Component({
  selector: 'app-factor-detail-page',
  imports: [Button, ErrorState, Icon, LoadingState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <h1 class="text-lg font-black text-gray-900">فاکتورها</h1>
      <span class="ms-auto"></span>
      <app-button variant="accent" size="sm" (click)="share()">
        به اشتراک‌گذاری
        <app-icon name="send" [size]="14" />
      </app-button>
    </div>
    @if (shared()) {
      <p role="status" class="mb-4 text-center text-xs text-success-deep">
        متن فاکتور در حافظه کپی شد
      </p>
    }

    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state [message]="error() ?? ''" (retry)="load()" />
    } @else if (invoice(); as invoice) {
      <div class="flex flex-col gap-4">
        <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <div class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900">
            <app-icon name="user" [size]="20" />
            <span>مشخصات فردی</span>
          </div>
          <dl class="flex flex-col gap-3 px-2 text-sm">
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">نام و نام خانوادگی</dt>
              <dd class="font-bold text-gray-900">{{ invoice.customerName }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">شماره موبایل</dt>
              <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.mobile) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">خودرو</dt>
              <dd class="font-bold text-gray-900">{{ invoice.carType }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">پلاک</dt>
              <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.plate) }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <div class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900">
            <app-icon name="receipt" [size]="20" />
            <span>مشخصات پرداخت</span>
          </div>
          <dl class="flex flex-col gap-3 px-2 text-sm">
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">کد پیگیری</dt>
              <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.trackingCode) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">تاریخ و زمان</dt>
              <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.dateTime) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-gray-500">اتوسرویس</dt>
              <dd class="font-bold text-gray-900">{{ invoice.serviceCenterName }}</dd>
            </div>
            <div class="my-1 border-t border-dashed border-gray-300"></div>
            @for (item of invoice.items; track item.title) {
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">{{ item.title }}</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(item.amountRial.toLocaleString('fa-IR')) }} ریال</dd>
              </div>
            }
          </dl>
        </section>
      </div>
    }
  `,
})
export class FactorDetailPage implements OnInit {
  private readonly gateway = inject(INVOICES_GATEWAY);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly invoice = signal<AdminInvoice | null>(null);
  protected readonly shared = signal(false);
  protected readonly toFaDigits = toFaDigits;

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const id = this.route.snapshot.paramMap.get('id') ?? '';
      this.invoice.set(await firstValueFrom(this.gateway.getById(id)));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }

  protected async share(): Promise<void> {
    const invoice = this.invoice();
    if (!invoice) {
      return;
    }
    const text =
      `فاکتور نوبتیفا - کد پیگیری ${invoice.trackingCode}\n` +
      `${invoice.customerName} - ${invoice.serviceCenterName}\n` +
      `مبلغ: ${invoice.amountRial} ریال`;
    const canShare = (navigator as Navigator & {
      share?: (data: { title: string; text: string; url: string }) => Promise<void>;
    }).share;
    try {
      if (canShare) {
        await canShare({ title: 'فاکتور نوبتیفا', text, url: window.location.href });
        return;
      }
      await this.copyText(text);
      this.shared.set(true);
    } catch {
      await this.copyText(text);
      this.shared.set(true);
    }
  }

  private async copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}
