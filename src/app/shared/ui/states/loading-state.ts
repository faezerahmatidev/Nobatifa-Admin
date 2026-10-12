import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center py-10" role="status" aria-label="در حال بارگذاری">
      <span
        class="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary-base"
      ></span>
    </div>
  `,
})
export class LoadingState {}
