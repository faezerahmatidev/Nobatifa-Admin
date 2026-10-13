import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AdminInvoiceSummary } from '../../data-access/admin-models';
import { INVOICES_GATEWAY } from '../../data-access/ports/invoices-gateway';
import { Button } from '../../shared/ui/button/button';
import { EmptyState } from '../../shared/ui/states/empty-state';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { toFaDigits } from '../../shared/utils/fa-digits';

@Component({
  selector: 'app-factors-page',
  imports: [RouterLink, Button, EmptyState, ErrorState, Icon, LoadingState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-4 text-lg font-black text-gray-900">فاکتورها</h1>

    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state [message]="error() ?? ''" (retry)="load()" />
    } @else if (items().length === 0) {
      <app-empty-state title="فاکتوری ثبت نشده است" />
    } @else {
      <div class="overflow-x-auto rounded-2xl">
        <table class="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr class="bg-accent-base text-white">
              <th class="rounded-r-xl px-4 py-3 font-bold">نام</th>
              <th class="px-4 py-3 font-bold">تاریخ</th>
              <th class="px-4 py-3 font-bold">مبلغ</th>
              <th class="rounded-l-xl px-4 py-3 font-bold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of items(); track invoice.id) {
              <tr class="bg-accent-pale/60">
                <td class="rounded-r-xl px-4 py-3 font-bold text-gray-800">{{ invoice.customerName }}</td>
                <td class="px-4 py-3 text-gray-700">{{ toFaDigits(invoice.dateTime) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ toFaDigits(invoice.amountRial.toLocaleString('fa-IR')) }} ریال</td>
                <td class="rounded-l-xl px-4 py-3">
                  <a [routerLink]="['/factors', invoice.id]">
                    <app-button size="sm">
                      نمایش فاکتور
                      <app-icon name="eye" [size]="14" />
                    </app-button>
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (totalPages() > 1) {
        <nav class="mt-4 flex items-center justify-center gap-1" aria-label="صفحه‌بندی">
          <button
            type="button"
            (click)="go(page() - 1)"
            [disabled]="page() <= 1"
            aria-label="صفحه قبل"
            class="flex size-9 items-center justify-center rounded-lg text-gray-600 disabled:text-gray-300"
          >
            <app-icon name="chevron-right" [size]="16" />
          </button>
          @for (number of pages(); track number) {
            @if (number === '…') {
              <span class="px-1 text-sm text-gray-400">…</span>
            } @else {
              <button
                type="button"
                (click)="go(number)"
                [attr.aria-current]="number === page() ? 'page' : null"
                [class]="
                  'size-9 rounded-lg text-sm font-bold ' +
                  (number === page() ? 'bg-accent-base text-white' : 'text-gray-600')
                "
              >
                {{ toFaDigits(number) }}
              </button>
            }
          }
          <button
            type="button"
            (click)="go(page() + 1)"
            [disabled]="page() >= totalPages()"
            aria-label="صفحه بعد"
            class="flex size-9 items-center justify-center rounded-lg text-gray-600 disabled:text-gray-300"
          >
            <app-icon name="chevron-left" [size]="16" />
          </button>
        </nav>
      }
    }
  `,
})
export class FactorsPage implements OnInit {
  private readonly gateway = inject(INVOICES_GATEWAY);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly items = signal<AdminInvoiceSummary[]>([]);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly toFaDigits = toFaDigits;

  ngOnInit(): void {
    this.load();
  }

  protected pages(): (number | '…')[] {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    const window = [1, 2, current - 1, current, current + 1, total - 1, total].filter(
      (number, index, all) => number >= 1 && number <= total && all.indexOf(number) === index,
    ).sort((a, b) => a - b);
    const result: (number | '…')[] = [];
    let previous = 0;
    for (const number of window) {
      if (number - previous > 1) {
        result.push('…');
      }
      result.push(number);
      previous = number;
    }
    return result;
  }

  protected async go(page: number): Promise<void> {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.page.set(page);
    await this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.gateway.list(this.page()));
      this.items.set(result.items);
      this.totalPages.set(result.totalPages);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }
}
