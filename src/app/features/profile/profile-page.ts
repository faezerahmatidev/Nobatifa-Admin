import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import type { StaffProfile } from '../../data-access/admin-models';
import { PROFILE_GATEWAY } from '../../data-access/ports/profile-gateway';
import { Button } from '../../shared/ui/button/button';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Modal } from '../../shared/ui/modal/modal';
import { TextField } from '../../shared/ui/input/text-field';

type ProfileDialog = 'mobile' | 'password' | null;

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, Button, ErrorState, Icon, LoadingState, Modal, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-4 text-lg font-black text-gray-900">پروفایل</h1>

    @if (loading()) {
      <app-loading-state />
    } @else if (error() && !profile()) {
      <app-error-state [message]="error() ?? ''" (retry)="load()" />
    } @else if (profile(); as staff) {
      <div class="mx-auto flex max-w-xl flex-col items-center">
        <span class="flex size-16 items-center justify-center rounded-full bg-gray-800 text-white">
          <app-icon name="user" [size]="28" />
        </span>
        <p class="mt-2 flex items-center gap-1 text-sm font-black text-gray-900">
          {{ staff.centerName }}
          <app-icon name="pencil" [size]="14" />
        </p>
        <p class="text-xs text-gray-500" dir="ltr">{{ staff.centerCode }}</p>
        <div class="mt-2 flex gap-2">
          <app-button variant="accent" size="sm" (click)="openDialog('mobile')">
            ویرایش شماره موبایل
            <app-icon name="pencil" [size]="12" />
          </app-button>
          <app-button variant="accent" size="sm" (click)="openDialog('password')">
            ویرایش رمز عبور
            <app-icon name="pencil" [size]="12" />
          </app-button>
        </div>

        <h2 class="mb-3 mt-6 text-sm font-black text-gray-900">اطلاعات شخصی</h2>
        <form (submit)="$event.preventDefault(); save()" class="flex w-full flex-col gap-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <app-text-field label="نام" [control]="firstName" error="نام الزامی است" />
            <app-text-field label="نام خانوادگی" [control]="lastName" error="نام خانوادگی الزامی است" />
          </div>
          @if (saveError()) {
            <p role="alert" class="text-center text-xs text-danger-bold">{{ saveError() }}</p>
          }
          @if (saved()) {
            <p role="status" class="text-center text-xs text-success-deep">ذخیره شد</p>
          }
          <app-button type="submit" size="lg" [fullWidth]="true" [disabled]="saving()">
            تایید
          </app-button>
        </form>
      </div>
    }

    <app-modal
      [open]="dialog() === 'mobile'"
      title="ویرایش شماره موبایل"
      size="sm"
      (closed)="closeDialog()"
    >
      <form (submit)="$event.preventDefault(); saveMobile()" class="flex flex-col gap-4">
        <input
          [formControl]="newMobile"
          type="tel"
          dir="rtl"
          inputmode="tel"
          placeholder="شماره موبایل جدید"
          aria-label="شماره موبایل جدید"
          class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
        />
        @if (newMobile.invalid && newMobile.touched) {
          <p class="text-xs text-danger-bold" role="alert">شماره موبایل معتبر نیست</p>
        }
        @if (dialogError()) {
          <p role="alert" class="text-center text-xs text-danger-bold">{{ dialogError() }}</p>
        }
        <app-button type="submit" size="lg" [fullWidth]="true" [disabled]="dialogBusy()">
          ذخیره
        </app-button>
      </form>
    </app-modal>

    <app-modal
      [open]="dialog() === 'password'"
      title="ویرایش رمز عبور"
      size="sm"
      (closed)="closeDialog()"
    >
      <form (submit)="$event.preventDefault(); savePassword()" class="flex flex-col gap-4">
        <input
          [formControl]="currentPassword"
          type="password"
          placeholder="رمز عبور فعلی"
          aria-label="رمز عبور فعلی"
          autocomplete="current-password"
          class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
        />
        <input
          [formControl]="newPassword"
          type="password"
          placeholder="رمز عبور جدید"
          aria-label="رمز عبور جدید"
          autocomplete="new-password"
          class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
        />
        @if (dialogError()) {
          <p role="alert" class="text-center text-xs text-danger-bold">{{ dialogError() }}</p>
        }
        @if (dialogSaved()) {
          <p role="status" class="text-center text-xs text-success-deep">رمز عبور تغییر کرد</p>
        }
        <app-button type="submit" size="lg" [fullWidth]="true" [disabled]="dialogBusy()">
          ذخیره
        </app-button>
      </form>
    </app-modal>
  `,
})
export class ProfilePage implements OnInit {
  private readonly gateway = inject(PROFILE_GATEWAY);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly profile = signal<StaffProfile | null>(null);
  protected readonly firstName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly lastName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly dialog = signal<ProfileDialog>(null);
  protected readonly dialogBusy = signal(false);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly dialogSaved = signal(false);
  protected readonly newMobile = new FormControl('', {
    validators: [Validators.required, Validators.pattern(/^09\d{9}$/)],
    nonNullable: true,
  });
  protected readonly currentPassword = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly newPassword = new FormControl('', {
    validators: [Validators.required, Validators.minLength(4)],
    nonNullable: true,
  });

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const profile = await firstValueFrom(this.gateway.getProfile());
      this.profile.set(profile);
      this.firstName.setValue(profile.firstName);
      this.lastName.setValue(profile.lastName);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (this.firstName.invalid || this.lastName.invalid) {
      this.firstName.markAsTouched();
      this.lastName.markAsTouched();
      return;
    }
    this.saving.set(true);
    this.saved.set(false);
    this.saveError.set(null);
    try {
      await firstValueFrom(
        this.gateway.updateNames(this.firstName.value.trim(), this.lastName.value.trim()),
      );
      this.saved.set(true);
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.saving.set(false);
    }
  }

  protected openDialog(kind: Exclude<ProfileDialog, null>): void {
    this.newMobile.setValue('');
    this.currentPassword.setValue('');
    this.newPassword.setValue('');
    this.dialogError.set(null);
    this.dialogSaved.set(false);
    this.dialog.set(kind);
  }

  protected closeDialog(): void {
    this.dialog.set(null);
  }

  protected async saveMobile(): Promise<void> {
    if (this.newMobile.invalid || this.dialogBusy()) {
      this.newMobile.markAsTouched();
      return;
    }
    this.dialogBusy.set(true);
    this.dialogError.set(null);
    try {
      await firstValueFrom(this.gateway.updateMobile(this.newMobile.value.trim()));
      await this.load();
      this.closeDialog();
    } catch (error) {
      this.dialogError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.dialogBusy.set(false);
    }
  }

  protected async savePassword(): Promise<void> {
    if (
      this.currentPassword.invalid ||
      this.newPassword.invalid ||
      this.dialogBusy()
    ) {
      this.currentPassword.markAsTouched();
      this.newPassword.markAsTouched();
      return;
    }
    this.dialogBusy.set(true);
    this.dialogError.set(null);
    this.dialogSaved.set(false);
    try {
      await firstValueFrom(
        this.gateway.changePassword(this.currentPassword.value, this.newPassword.value.trim()),
      );
      this.dialogSaved.set(true);
    } catch (error) {
      this.dialogError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.dialogBusy.set(false);
    }
  }
}
