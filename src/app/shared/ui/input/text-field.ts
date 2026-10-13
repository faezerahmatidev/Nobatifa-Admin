import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-field',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1">
      <label class="flex flex-col gap-1 text-sm font-bold text-gray-800">
        {{ label() }}
        <input
          [formControl]="control()"
          [type]="type()"
          [placeholder]="placeholder()"
          [class]="inputClasses()"
        />
      </label>
      @if (showError() && error()) {
        <p class="text-xs text-danger-bold" role="alert">{{ error() }}</p>
      }
    </div>
  `,
})
export class TextField {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | null>>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly error = input<string | null>(null);

  protected showError(): boolean {
    const control = this.control();
    return control.invalid && control.touched;
  }

  protected inputClasses(): string {
    return (
      'h-12 rounded-xl border bg-white px-4 text-sm font-normal text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-base ' +
      (this.showError() ? 'border-danger-base' : 'border-gray-300')
    );
  }
}
