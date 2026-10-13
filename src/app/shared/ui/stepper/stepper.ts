import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-2 flex items-center justify-center" aria-hidden="true">
      @for (label of labels(); track $index) {
        <span
          [class]="
            'flex size-5 items-center justify-center rounded-full border-2 text-[10px] font-bold ' +
            ($index < step()
              ? 'border-success-deep bg-success-deep text-white'
              : $index === step()
                ? 'border-primary-base bg-primary-base text-white'
                : 'border-gray-300 bg-gray-200 text-transparent')
          "
        >
          @if ($index < step()) {
            ✓
          } @else {
            •
          }
        </span>
        @if ($index < labels().length - 1) {
          <span
            [class]="'h-0.5 w-16 sm:w-24 ' + ($index < step() ? 'bg-success-deep' : 'bg-gray-200')"
          ></span>
        }
      }
    </div>
    <p class="mb-4 text-center text-sm font-bold text-gray-800">{{ labels()[step()] }}</p>
  `,
})
export class Stepper {
  readonly labels = input.required<readonly string[]>();
  readonly step = input.required<number>();
}
