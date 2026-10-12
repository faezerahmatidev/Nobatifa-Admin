import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2 py-10 text-center">
      <p class="font-bold text-gray-800">{{ title() }}</p>
      @if (message()) {
        <p class="text-sm text-gray-500">{{ message() }}</p>
      }
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
}
