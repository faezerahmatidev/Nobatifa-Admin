const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)]);
}
