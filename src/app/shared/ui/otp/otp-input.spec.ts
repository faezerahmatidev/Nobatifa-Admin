import { TestBed } from '@angular/core/testing';
import { OtpInput } from './otp-input';

describe('OtpInput', () => {
  it('builds the code from boxes', () => {
    const fixture = TestBed.createComponent(OtpInput);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const boxes = el.querySelectorAll('input');
    expect(boxes.length).toBe(4);
    (boxes[0] as HTMLInputElement).value = '1';
    boxes[0].dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.code()).toBe('1');
  });
});
