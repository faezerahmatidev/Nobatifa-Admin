import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { Button } from '../../shared/ui/button/button';
import { Icon, type IconName } from '../../shared/ui/icon/icon';
import { Modal } from '../../shared/ui/modal/modal';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: '/dashboard', label: 'داشبورد', icon: 'dashboard' },
  { path: '/appointments', label: 'نوبت‌ها', icon: 'appointments' },
  { path: '/time', label: 'مدیریت زمان', icon: 'clock' },
  { path: '/factors', label: 'فاکتورها', icon: 'receipt' },
  { path: '/services', label: 'مدیریت خدمات', icon: 'settings' },
];

/**
 * Admin shell (per Figma): right sidebar with nav + staff card,
 * top bar with breadcrumb + Jalali date, content outlet.
 * Feature routes land in Phase 6; nav targets already match the plan.
 * Mobile (no Figma reference — desktop-first product): hamburger drawer.
 */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Button, Icon, Modal, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh bg-white">
      <aside
        class="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-l border-gray-200 bg-gray-50 p-4 lg:flex"
        aria-label="ناوبری مدیریت"
      >
        <ng-container *ngTemplateOutlet="sidebarContent" />
      </aside>

      @if (drawerOpen()) {
        <div class="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            class="absolute inset-0 cursor-default bg-gray-900/50"
            (click)="drawerOpen.set(false)"
            aria-label="بستن منو"
            data-testid="drawer-backdrop"
          ></button>
          <aside
            class="absolute inset-y-0 right-0 flex w-64 flex-col bg-gray-50 p-4"
            aria-label="ناوبری مدیریت"
          >
            <ng-container *ngTemplateOutlet="sidebarContent" />
          </aside>
        </div>
      }

      <ng-template #sidebarContent>
        <div class="mb-6 flex items-center gap-2 px-2">
          <img src="/logo.svg" alt="نوبتیفا" class="h-8 w-auto" />
        </div>
        <nav class="flex flex-1 flex-col gap-1">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-primary-pale font-bold text-primary-bold"
              (click)="drawerOpen.set(false)"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700"
            >
              <app-icon [name]="item.icon" [size]="18" />
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="mt-4 border-t border-gray-200 pt-4">
          <a
            routerLink="/profile"
            (click)="drawerOpen.set(false)"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-100"
          >
            <app-icon name="user" [size]="18" />
            {{ staffLabel() }}
          </a>
          <app-button variant="text" [fullWidth]="true" (click)="confirmLogout.set(true)">
            <app-icon name="log-out" [size]="18" />
            خروج
          </app-button>
        </div>
      </ng-template>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4">
          <button
            type="button"
            class="rounded-lg p-2 text-gray-700 lg:hidden"
            (click)="drawerOpen.update((open) => !open)"
            [attr.aria-expanded]="drawerOpen()"
            aria-label="منو"
          >
            <app-icon [name]="drawerOpen() ? 'x' : 'menu'" />
          </button>
          <p class="text-sm text-gray-500">
            پنل
            <span class="text-gray-300"> / </span>
            <span class="font-bold text-primary-bold">{{ currentSection() }}</span>
          </p>
          <p class="ms-auto flex items-center gap-1 text-sm text-gray-600">
            <app-icon name="clock" [size]="16" />
            {{ today() }}
          </p>
        </header>
        <main class="flex-1 px-4 py-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-modal
      [open]="confirmLogout()"
      title="خروج از حساب"
      size="sm"
      (closed)="confirmLogout.set(false)"
    >
      <p class="text-center text-sm leading-6 text-gray-700">
        آیا مطمئن هستید که می‌خواهید خارج شوید؟
      </p>
      <div class="mt-4 grid grid-cols-2 gap-2">
        <app-button variant="danger" [fullWidth]="true" (click)="logout()">
          بله، خارج شو
        </app-button>
        <app-button variant="text" [fullWidth]="true" (click)="confirmLogout.set(false)">
          انصراف
        </app-button>
      </div>
    </app-modal>
  `,
})
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly navItems = NAV_ITEMS;
  protected readonly drawerOpen = signal(false);
  protected readonly confirmLogout = signal(false);
  protected readonly today = signal(
    new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date()),
  );

  protected staffLabel(): string {
    return this.auth.user()?.mobile || 'پشتیبان';
  }

  protected currentSection(): string {
    const url = this.router.url;
    if (url === '/profile' || url.startsWith('/profile/')) {
      return 'پروفایل';
    }
    if (url.startsWith('/factors/')) {
      return 'فاکتورها';
    }
    if (url.startsWith('/dashboard/register')) {
      return 'داشبورد / ثبت مشتری';
    }
    return NAV_ITEMS.find((item) => url === item.path || url.startsWith(`${item.path}/`))?.label ?? 'داشبورد';
  }

  protected async logout(): Promise<void> {
    this.confirmLogout.set(false);
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
