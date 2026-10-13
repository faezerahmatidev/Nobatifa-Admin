import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AdminInvoice, ServiceItem } from '../../data-access/admin-models';
import type { CustomerCar } from '../../data-access/ports/customer-registration-gateway';
import { CUSTOMER_REGISTRATION_GATEWAY } from '../../data-access/ports/customer-registration-gateway';
import { SERVICES_GATEWAY } from '../../data-access/ports/services-gateway';
import { Banner } from '../../shared/ui/banner/banner';
import { Button } from '../../shared/ui/button/button';
import { ErrorState } from '../../shared/ui/states/error-state';
import { Icon } from '../../shared/ui/icon/icon';
import { LoadingState } from '../../shared/ui/states/loading-state';
import { Modal } from '../../shared/ui/modal/modal';
import { OtpInput } from '../../shared/ui/otp/otp-input';
import { Stepper } from '../../shared/ui/stepper/stepper';
import { toFaDigits } from '../../shared/utils/fa-digits';

const STEPS = ['شماره موبایل مشتری', 'کد تایید', 'مشخصات مشتری', 'انتخاب خودرو', 'ثبت خدمات'];

const CAR_TYPES = ['پراید', 'کوییک', 'سمند', 'پژو 206', 'دنا'];

const PLATE_LETTERS = ['الف', 'ب', 'ج', 'س', 'ص', 'ط', 'ق', 'ل', 'م', 'ن', 'و', 'هـ', 'ی'];

interface CarDraft {
  type: string;
  part1: string;
  letter: string;
  part2: string;
  iranCode: string;
}

@Component({
  selector: 'app-register-customer-page',
  imports: [ReactiveFormsModule, Banner, Button, ErrorState, Icon, LoadingState, Modal, OtpInput, Stepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state [message]="error() ?? ''" (retry)="reload()" />
    } @else if (done(); as invoice) {
      <div class="mx-auto max-w-2xl">
        <p class="flex justify-center">
          <span class="flex size-14 items-center justify-center rounded-full bg-success-deep text-white">
            <app-icon name="check" [size]="28" />
          </span>
        </p>
        <h1 class="mt-3 text-center text-lg font-black text-success-deep">مشتری ثبت شد!</h1>
        <div class="mt-4 flex flex-col gap-4">
          <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900">
              <app-icon name="user" [size]="20" />
              <span>مشخصات فردی</span>
            </div>
            <dl class="flex flex-col gap-3 px-2 text-sm">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">نام و نام خانوادگی</dt>
                <dd class="font-bold text-gray-900">{{ invoice.customerName }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">شماره موبایل</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.mobile) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">خودرو</dt>
                <dd class="font-bold text-gray-900">{{ invoice.carType }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">پلاک</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.plate) }}</dd>
              </div>
            </dl>
          </section>
          <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900">
              <app-icon name="receipt" [size]="20" />
              <span>مشخصات پرداخت</span>
            </div>
            <dl class="flex flex-col gap-3 px-2 text-sm">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">کد پیگیری</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.trackingCode) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">تاریخ و زمان</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.dateTime) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">اتوسرویس</dt>
                <dd class="font-bold text-gray-900">{{ invoice.serviceCenterName }}</dd>
              </div>
              <div class="my-1 border-t border-dashed border-gray-300"></div>
              @for (item of invoice.items; track item.title) {
                <div class="flex items-center justify-between gap-4">
                  <dt class="text-gray-500">{{ item.title }}</dt>
                  <dd class="font-bold text-gray-900">{{ toFaDigits(item.amountRial.toLocaleString('fa-IR')) }} ریال</dd>
                </div>
              }
              <div class="flex items-center justify-between gap-4">
                <dt class="font-black text-gray-900">جمع</dt>
                <dd class="font-black text-primary-bold">{{ toFaDigits(invoice.amountRial.toLocaleString('fa-IR')) }} ریال</dd>
              </div>
            </dl>
          </section>
          <section class="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div class="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-black text-gray-900">
              <app-icon name="settings" [size]="20" />
              <span>خدمات</span>
            </div>
            <dl class="flex flex-col gap-3 px-2 text-sm">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">کیلومتر</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.mileageKm.toLocaleString('fa-IR')) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">کیلومتر بعدی</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.nextMileageKm.toLocaleString('fa-IR')) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500">نوع روغن</dt>
                <dd class="font-bold text-gray-900">{{ toFaDigits(invoice.oilType) }}</dd>
              </div>
            </dl>
          </section>
        </div>
        <div class="mx-auto mt-6 flex max-w-md gap-2">
          <app-button variant="accent" [fullWidth]="true" (click)="shareInvoice(invoice)">
            به اشتراک‌گذاری
            <app-icon name="send" [size]="14" />
          </app-button>
          <app-button [fullWidth]="true" (click)="finish()">تایید</app-button>
        </div>
        @if (shared()) {
          <p role="status" class="mt-2 text-center text-xs text-success-deep">متن فاکتور در حافظه کپی شد</p>
        }
      </div>
    } @else {
      <app-stepper [labels]="steps" [step]="step()" />

      @if (step() === 0) {
        <app-banner text="شماره موبایل مشتری خود را وارد کنید." class="mb-4 block" />
        <div class="mx-auto max-w-md">
          <input
            [formControl]="mobile"
            type="tel"
            dir="rtl"
            inputmode="tel"
            placeholder="شماره موبایل"
            aria-label="شماره موبایل مشتری"
            class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
          />
          @if (mobile.invalid && mobile.touched) {
            <p class="mt-1 text-xs text-danger-bold" role="alert">شماره موبایل معتبر نیست</p>
          }
          @if (formError()) {
            <p role="alert" class="mt-1 text-center text-xs text-danger-bold">{{ formError() }}</p>
          }
        </div>
      }

      @if (step() === 1) {
        <h1 class="text-center text-sm font-black text-gray-900">کد تایید</h1>
        <p class="mt-2 text-center text-[13px] text-gray-500">
          ما یک کد تایید برای شماره {{ toFaDigits(mobile.value) }} ارسال کردیم.
        </p>
        <form (submit)="$event.preventDefault()" class="my-6">
          <app-otp-input [(code)]="code" />
        </form>
        <p class="text-center text-xs text-gray-500">
          کد تایید ارسال نشده است؟
          <button type="button" (click)="resend()" class="font-bold text-primary-bold">
            برای ارسال مجدد کلیک کنید.
          </button>
        </p>
        @if (formError()) {
          <p role="alert" class="mt-2 text-center text-xs text-danger-bold">{{ formError() }}</p>
        }
      }

      @if (step() === 2) {
        <div class="mx-auto grid max-w-xl gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <input
              [formControl]="firstName"
              type="text"
              placeholder="نام"
              aria-label="نام مشتری"
              [class]="nameClasses(firstName)"
            />
            @if (firstName.invalid && firstName.touched) {
              <p class="flex items-center gap-1 text-xs text-danger-bold" role="alert">
                <app-icon name="warning" [size]="12" />
                این فیلد اجباری می‌باشد
              </p>
            }
          </div>
          <div class="flex flex-col gap-1">
            <input
              [formControl]="lastName"
              type="text"
              placeholder="نام خانوادگی"
              aria-label="نام خانوادگی مشتری"
              [class]="nameClasses(lastName)"
            />
            @if (lastName.invalid && lastName.touched) {
              <p class="flex items-center gap-1 text-xs text-danger-bold" role="alert">
                <app-icon name="warning" [size]="12" />
                این فیلد اجباری می‌باشد
              </p>
            }
          </div>
        </div>
      }

      @if (step() === 3) {
        <app-banner text="از میان خودروهای زیر انتخاب کنید و سپس به مرحله بعد بروید." class="mb-4 block" />
        <div class="flex justify-center">
          <app-button variant="accent" size="sm" (click)="carModal.set(true)">
            خودروی جدید
            <span class="flex size-5 items-center justify-center rounded-md border border-current">
              <app-icon name="plus" [size]="12" />
            </span>
          </app-button>
        </div>
        @if (cars().length === 0) {
          <app-banner
            tone="warning"
            text="خودرویی جهت نمایش موجود نیست! ابتدا یک خودروی جدید اضافه کنید."
            class="mx-auto mt-4 block max-w-xl"
          />
        } @else {
          <div class="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (car of cars(); track car.id) {
              <button
                type="button"
                (click)="selectedCarId.set(car.id)"
                [attr.aria-pressed]="selectedCarId() === car.id"
                [class]="
                  'flex h-12 items-center justify-between rounded-xl border bg-white px-4 text-sm text-gray-800 ' +
                  (selectedCarId() === car.id ? 'border-primary-base' : 'border-gray-300')
                "
              >
                <span class="flex items-center gap-2">
                  <app-icon name="car" [size]="18" />
                  {{ car.type }}
                </span>
                {{ toFaDigits(car.plate) }}
                @if (selectedCarId() === car.id) {
                  <span class="flex size-5 items-center justify-center rounded-md bg-primary-base text-white">
                    <app-icon name="check" [size]="12" />
                  </span>
                }
              </button>
            }
          </div>
        }
      }

      @if (step() === 4) {
        <div class="mx-auto flex max-w-2xl flex-col gap-2">
          @for (service of services(); track service.id) {
            <div
              [class]="
                'rounded-xl border bg-white ' +
                (expandedId() === service.id ? 'border-primary-soft' : 'border-gray-200')
              "
            >
              <div class="flex items-center gap-2 px-4 py-3">
                <button
                  type="button"
                  (click)="toggleService(service.id)"
                  [attr.aria-pressed]="isChecked(service.id)"
                  aria-label="انتخاب خدمت"
                  [class]="
                    'flex size-5 items-center justify-center rounded-md border ' +
                    (isChecked(service.id)
                      ? 'border-primary-base bg-primary-base text-white'
                      : 'border-gray-300 text-transparent')
                  "
                >
                  <app-icon name="check" [size]="12" />
                </button>
                <span class="flex-1 text-right text-sm text-gray-800">{{ service.title }}</span>
                <button
                  type="button"
                  (click)="expandedId.set(expandedId() === service.id ? null : service.id)"
                  [attr.aria-expanded]="expandedId() === service.id"
                  aria-label="جزئیات خدمت"
                  class="text-gray-400"
                >
                  <app-icon [name]="expandedId() === service.id ? 'chevron-up' : 'chevron-down'" [size]="16" />
                </button>
              </div>
              @if (expandedId() === service.id) {
                <div class="flex flex-col gap-3 border-t border-gray-100 px-4 py-4">
                  <div class="grid gap-3 sm:grid-cols-3">
                    <input
                      [value]="detail(service.id).kilometers"
                      (input)="setDetail(service.id, 'kilometers', $any($event.target).value)"
                      inputmode="numeric"
                      placeholder="کیلومتر"
                      [attr.aria-label]="'کیلومتر ' + service.title"
                      class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
                    />
                    <input
                      [value]="detail(service.id).nextKilometers"
                      (input)="setDetail(service.id, 'nextKilometers', $any($event.target).value)"
                      inputmode="numeric"
                      placeholder="کیلومتر بعدی"
                      [attr.aria-label]="'کیلومتر بعدی ' + service.title"
                      class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
                    />
                    <input
                      [value]="detail(service.id).oilType"
                      (input)="setDetail(service.id, 'oilType', $any($event.target).value)"
                      type="text"
                      placeholder="نوع روغن"
                      [attr.aria-label]="'نوع روغن ' + service.title"
                      class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
                    />
                  </div>
                  <input
                    [value]="detail(service.id).price"
                    (input)="setDetail(service.id, 'price', $any($event.target).value)"
                    inputmode="numeric"
                    placeholder="قیمت"
                    [attr.aria-label]="'قیمت ' + service.title"
                    class="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary-base"
                  />
                  @if (detail(service.id).price.trim()) {
                    <p class="flex items-center gap-1 text-xs text-gray-500">
                      <app-icon name="info" [size]="12" />
                      {{ toFaDigits(detail(service.id).price) }} ریال
                    </p>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <div class="mx-auto mt-6 flex max-w-md gap-2">
        <app-button
          variant="accent"
          [fullWidth]="true"
          [disabled]="step() === 0"
          (click)="back()"
        >
          مرحله قبل
          <app-icon name="chevron-right" [size]="14" />
        </app-button>
        @if (step() < 4) {
          <app-button [fullWidth]="true" [disabled]="!canNext() || busy()" (click)="next()">
            مرحله بعد
            <app-icon name="chevron-left" [size]="14" />
          </app-button>
        } @else {
          <app-button [fullWidth]="true" [disabled]="!canSubmit() || busy()" (click)="submit()">
            تایید
          </app-button>
        }
      </div>
      @if (formError() && step() > 1) {
        <p role="alert" class="mt-2 text-center text-xs text-danger-bold">{{ formError() }}</p>
      }
    }

    <app-modal
      [open]="carModal()"
      title="خودروی جدید"
      size="sm"
      (closed)="carModal.set(false)"
    >
      <div class="flex flex-col gap-3">
        <select
          [value]="carDraft.type"
          (change)="carDraft.type = $any($event.target).value"
          aria-label="نوع خودرو"
          class="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-primary-base"
        >
          @for (type of carTypes; track type) {
            <option [value]="type">{{ type }}</option>
          }
        </select>
        <div class="flex items-center gap-2" dir="ltr">
          <input
            [value]="carDraft.part1"
            (input)="carDraft.part1 = $any($event.target).value"
            inputmode="numeric"
            maxlength="2"
            placeholder="11"
            aria-label="دو رقم اول پلاک"
            class="h-12 w-full rounded-xl border border-gray-300 bg-white px-2 text-center text-sm text-gray-900 outline-none focus:border-primary-base"
          />
          <select
            [value]="carDraft.letter"
            (change)="carDraft.letter = $any($event.target).value"
            aria-label="حرف پلاک"
            class="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-2 text-center text-sm text-gray-900 outline-none focus:border-primary-base"
          >
            @for (letter of plateLetters; track letter) {
              <option [value]="letter">{{ letter }}</option>
            }
          </select>
          <input
            [value]="carDraft.part2"
            (input)="carDraft.part2 = $any($event.target).value"
            inputmode="numeric"
            maxlength="3"
            placeholder="365"
            aria-label="سه رقم پلاک"
            class="h-12 w-full rounded-xl border border-gray-300 bg-white px-2 text-center text-sm text-gray-900 outline-none focus:border-primary-base"
          />
          <input
            [value]="carDraft.iranCode"
            (input)="carDraft.iranCode = $any($event.target).value"
            inputmode="numeric"
            maxlength="2"
            placeholder="45"
            aria-label="کد ایران پلاک"
            class="h-12 w-full rounded-xl border border-gray-300 bg-white px-2 text-center text-sm text-gray-900 outline-none focus:border-primary-base"
          />
        </div>
        @if (carError()) {
          <p role="alert" class="text-center text-xs text-danger-bold">{{ carError() }}</p>
        }
        <app-button [fullWidth]="true" size="lg" (click)="saveCar()">تایید</app-button>
      </div>
    </app-modal>
  `,
})
export class RegisterCustomerPage implements OnInit {
  private readonly registration = inject(CUSTOMER_REGISTRATION_GATEWAY);
  private readonly servicesGateway = inject(SERVICES_GATEWAY);
  private readonly router = inject(Router);

  protected readonly steps = STEPS;
  protected readonly carTypes = CAR_TYPES;
  protected readonly plateLetters = PLATE_LETTERS;
  protected readonly toFaDigits = toFaDigits;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly step = signal(0);
  protected readonly done = signal<AdminInvoice | null>(null);
  protected readonly shared = signal(false);
  protected readonly carModal = signal(false);
  protected readonly carError = signal<string | null>(null);

  protected readonly mobile = new FormControl('', {
    validators: [Validators.required, Validators.pattern(/^09\d{9}$/)],
    nonNullable: true,
  });
  protected readonly code = signal('');
  protected readonly firstName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly lastName = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  protected readonly cars = signal<CustomerCar[]>([]);
  protected readonly selectedCarId = signal<string | null>(null);
  protected readonly services = signal<ServiceItem[]>([]);
  protected readonly checkedIds = signal<string[]>([]);
  protected readonly expandedId = signal<string | null>(null);
  protected readonly details = signal<Record<string, { kilometers: string; nextKilometers: string; oilType: string; price: string }>>({});
  protected carDraft: CarDraft = { type: CAR_TYPES[0], part1: '', letter: 'س', part2: '', iranCode: '' };

  ngOnInit(): void {
    this.reload();
  }

  protected nameClasses(control: FormControl<string>): string {
    const invalid = control.invalid && control.touched;
    return (
      'h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-base ' +
      (invalid ? 'border-danger-base' : 'border-gray-300')
    );
  }

  protected detail(serviceId: string): { kilometers: string; nextKilometers: string; oilType: string; price: string } {
    return (
      this.details()[serviceId] ?? { kilometers: '', nextKilometers: '', oilType: '', price: '' }
    );
  }

  protected setDetail(serviceId: string, field: 'kilometers' | 'nextKilometers' | 'oilType' | 'price', value: string): void {
    this.details.update((all) => ({
      ...all,
      [serviceId]: { ...this.detail(serviceId), [field]: value },
    }));
  }

  protected priceRial(serviceId: string): number {
    const latin = this.detail(serviceId)
      .price.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/\D/g, '');
    return latin ? Number(latin) : 0;
  }

  protected toggleService(serviceId: string): void {
    this.checkedIds.update((ids) =>
      ids.includes(serviceId) ? ids.filter((id) => id !== serviceId) : [...ids, serviceId],
    );
  }

  protected isChecked(serviceId: string): boolean {
    return this.checkedIds().includes(serviceId);
  }

  protected canNext(): boolean {
    if (this.step() === 0) {
      return this.mobile.valid;
    }
    if (this.step() === 1) {
      return this.code().replace(/\D/g, '').length === 4;
    }
    if (this.step() === 2) {
      return this.firstName.valid && this.lastName.valid;
    }
    if (this.step() === 3) {
      return this.selectedCarId() !== null;
    }
    return true;
  }

  protected canSubmit(): boolean {
    return this.checkedIds().length > 0;
  }

  protected back(): void {
    this.formError.set(null);
    this.step.update((value) => Math.max(0, value - 1));
  }

  protected async next(): Promise<void> {
    if (!this.canNext() || this.busy()) {
      if (this.step() === 0) this.mobile.markAsTouched();
      if (this.step() === 2) {
        this.firstName.markAsTouched();
        this.lastName.markAsTouched();
      }
      return;
    }
    this.busy.set(true);
    this.formError.set(null);
    try {
      if (this.step() === 0) {
        await firstValueFrom(this.registration.sendOtp(this.mobile.value.trim()));
        this.step.set(1);
      } else if (this.step() === 1) {
        await firstValueFrom(
          this.registration.verifyOtp(this.mobile.value.trim(), this.code()),
        );
        this.step.set(2);
      } else if (this.step() === 2) {
        this.step.set(3);
        await this.loadCars();
      } else if (this.step() === 3) {
        this.step.set(4);
        await this.loadServices();
      }
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.busy.set(false);
    }
  }

  protected async resend(): Promise<void> {
    try {
      await firstValueFrom(this.registration.sendOtp(this.mobile.value.trim()));
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    }
  }

  protected async saveCar(): Promise<void> {
    const draft = this.carDraft;
    const plate = `${draft.part1} ${draft.letter} ${draft.part2} ${draft.iranCode}`.trim();
    this.carError.set(null);
    try {
      const created = await firstValueFrom(
        this.registration.addCar(this.mobile.value.trim(), { type: draft.type, plate }),
      );
      this.cars.update((cars) => [...cars, created]);
      this.selectedCarId.set(created.id);
      this.carModal.set(false);
      this.carDraft = { type: CAR_TYPES[0], part1: '', letter: 'س', part2: '', iranCode: '' };
    } catch (error) {
      this.carError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    }
  }

  protected async submit(): Promise<void> {
    if (!this.canSubmit() || this.busy()) {
      return;
    }
    const car = this.cars().find((item) => item.id === this.selectedCarId());
    if (!car) {
      return;
    }
    this.busy.set(true);
    this.formError.set(null);
    try {
      const services = this.services().filter((service) => this.isChecked(service.id));
      const invoice = await firstValueFrom(
        this.registration.submit({
          mobile: this.mobile.value.trim(),
          firstName: this.firstName.value.trim(),
          lastName: this.lastName.value.trim(),
          car,
          services: services.map((service) => ({
            serviceId: service.id,
            title: service.title,
            kilometers: this.detail(service.id).kilometers,
            nextKilometers: this.detail(service.id).nextKilometers,
            oilType: this.detail(service.id).oilType,
            priceRial: this.priceRial(service.id),
          })),
        }),
      );
      this.done.set(invoice);
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.busy.set(false);
    }
  }

  protected async shareInvoice(invoice: AdminInvoice): Promise<void> {
    const text = `فاکتور نوبتیفا - کد پیگیری ${invoice.trackingCode}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        this.shared.set(true);
      }
    } catch {
      this.shared.set(false);
    }
  }

  protected finish(): void {
    void this.router.navigate(['/dashboard']);
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.loadServices();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'خطایی رخ داد');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCars(): Promise<void> {
    const cars = await firstValueFrom(this.registration.getCars(this.mobile.value.trim()));
    this.cars.set(cars);
    if (!cars.some((car) => car.id === this.selectedCarId())) {
      this.selectedCarId.set(null);
    }
  }

  private async loadServices(): Promise<void> {
    const services = await firstValueFrom(this.servicesGateway.list());
    this.services.set(services);
  }
}
