import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-access-denied-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2 py-10 text-center">
      <p class="font-bold text-gray-800">دسترسی ندارید</p>
      <p class="text-sm text-gray-500">این بخش فقط برای نقش‌های مجاز قابل مشاهده است.</p>
    </div>
  `,
})
export class AccessDeniedState {}
