import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

export type ModalSize = 'sm' | 'md' | 'lg';

const WIDTH_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

@Component({
  selector: 'app-modal',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
        (click)="closed.emit()"
        (keydown.enter)="closed.emit()"
        tabindex="0"
        role="button"
        aria-label="بستن پنجره"
        data-testid="backdrop"
      >
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          [class]="'w-full rounded-2xl bg-white p-6 shadow-xl ' + WIDTH_CLASSES[size()]"
        >
          <div class="relative mb-4 flex items-center justify-center">
            <h2 class="text-lg font-black text-gray-900">{{ title() }}</h2>
            <button
              type="button"
              (click)="closed.emit()"
              aria-label="بستن"
              class="absolute right-0 flex size-7 items-center justify-center rounded-lg border border-gray-300 text-gray-600"
            >
              <app-icon name="x" [size]="14" />
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input('');
  readonly size = input<ModalSize>('md');
  readonly closed = output<void>();

  protected readonly WIDTH_CLASSES = WIDTH_CLASSES;

  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
