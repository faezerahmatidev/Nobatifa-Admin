import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth-service';

/**
 * Admin login (mobile + password, per Figma Auth screens).
 * The "forgot password" link is visual-only for now; its target flow is
 * unevidenced (see docs/admin-requirements.md) and will not be invented here.
 */
@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex min-h-dvh w-full max-w-7xl items-center gap-10 px-4 py-8">
      <div class="mx-auto flex w-full max-w-[360px] shrink-0 flex-col justify-center px-4">
        <h1 class="flex items-center justify-center gap-2 text-xl font-black text-gray-900">
          <img src="/logo.svg" alt="" class="h-10 w-auto" />
          ورود به نوبتیفا
        </h1>
        <p class="mt-2 text-center text-sm text-gray-500">
          برای ورود به پنل مدیریت، شماره موبایل و رمز عبور خود را وارد کنید.
        </p>
      <form (submit)="$event.preventDefault(); submit()" class="mt-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <input
            [formControl]="mobile"
            type="tel"
            inputmode="tel"
            placeholder="شماره موبایل"
            aria-label="شماره موبایل"
            [class]="inputClasses(mobile.invalid && mobile.touched)"
          />
          @if (mobile.invalid && mobile.touched) {
            <p class="text-xs text-danger-bold" role="alert">شماره موبایل معتبر نیست</p>
          }
        </div>
        <div class="flex flex-col gap-1">
          <input
            [formControl]="password"
            type="password"
            placeholder="رمز عبور"
            aria-label="رمز عبور"
            autocomplete="current-password"
            [class]="inputClasses(password.invalid && password.touched)"
          />
          @if (password.invalid && password.touched) {
            <p class="text-xs text-danger-bold" role="alert">رمز عبور الزامی است</p>
          }
        </div>
        @if (error()) {
          <p role="alert" class="text-center text-xs text-danger-bold">{{ error() }}</p>
        }
        <button
          type="button"
          class="text-center text-xs font-bold text-primary-bold"
        >
          رمز عبور خود را فراموش کردید؟
        </button>
        <button
          type="submit"
          [disabled]="busy()"
          class="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-base text-base font-bold text-white transition-colors hover:bg-primary-bold disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          ورود
        </button>
      </form>
      </div>
      <img
        src="/images/auth-desktop.png"
        alt=""
        class="hidden max-h-[calc(100dvh-4rem)] w-auto max-w-[55%] self-center rounded-2xl lg:block"
      />
    </section>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mobile = new FormControl('', {
    validators: [Validators.required, Validators.pattern(/^09\d{9}$/)],
    nonNullable: true,
  });
  protected readonly password = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });

  protected inputClasses(invalid: boolean): string {
    return (
      'h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-base ' +
      (invalid ? 'border-danger-base' : 'border-gray-300')
    );
  }

  protected async submit(): Promise<void> {
    if (this.mobile.invalid || this.password.invalid) {
      this.mobile.markAsTouched();
      this.password.markAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.login(this.mobile.value.trim(), this.password.value));
      await this.router.navigate(['/']);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.busy.set(false);
    }
  }
}
