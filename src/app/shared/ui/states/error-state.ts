import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-error-state',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3 py-10 text-center">
      <p role="alert" class="text-sm text-gray-700">{{ message() }}</p>
      <app-button variant="text" (click)="retry.emit()">تلاش مجدد</app-button>
    </div>
  `,
})
export class ErrorState {
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
