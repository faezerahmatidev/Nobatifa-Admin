import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'accent' | 'text' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  lg: 'h-12 px-6 text-base',
  md: 'h-10 px-5 text-sm',
  sm: 'h-8 px-4 text-xs',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-base text-white hover:bg-primary-bold active:bg-primary-deep disabled:bg-gray-300',
  accent:
    'border border-accent-base bg-white text-accent-base hover:bg-accent-pale disabled:border-gray-300 disabled:text-gray-400',
  text: 'text-primary-bold hover:bg-primary-pale disabled:text-gray-400',
  danger:
    'bg-danger-base text-white hover:bg-danger-bold active:bg-danger-deep disabled:bg-gray-300',
};

/** Shared button: same variant/size contract as the website design system. */
@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [attr.type]="type()" [disabled]="disabled()" [class]="classes()">
      <ng-content />
    </button>
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);

  protected readonly classes = computed(
    () =>
      'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors disabled:cursor-not-allowed ' +
      `${SIZE_CLASSES[this.size()]} ${VARIANT_CLASSES[this.variant()]}` +
      (this.fullWidth() ? ' w-full' : ''),
  );
}
