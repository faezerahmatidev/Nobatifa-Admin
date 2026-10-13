import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

export type BannerTone = 'info' | 'warning' | 'success';

const TONE_CLASSES: Record<BannerTone, string> = {
  info: 'bg-info-pale text-gray-700',
  warning: 'bg-warning-pale text-gray-700',
  success: 'bg-success-pale text-gray-700',
};

@Component({
  selector: 'app-banner',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p [class]="'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm ' + TONE_CLASSES[tone()]">
      <app-icon name="info" [size]="18" />
      {{ text() }}
    </p>
  `,
})
export class Banner {
  readonly text = input.required<string>();
  readonly tone = input<BannerTone>('info');

  protected readonly TONE_CLASSES = TONE_CLASSES;
}
