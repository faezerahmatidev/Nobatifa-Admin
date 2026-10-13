import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'app-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="label()"
      (click)="checked.set(!checked())"
      [class]="
        'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
        (checked() ? 'bg-primary-base' : 'bg-gray-300')
      "
    >
      <span
        [class]="
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ' +
          (checked() ? 'left-0.5' : 'right-0.5')
        "
      ></span>
    </button>
  `,
})
export class Switch {
  readonly label = input.required<string>();
  readonly checked = model(false);
}
