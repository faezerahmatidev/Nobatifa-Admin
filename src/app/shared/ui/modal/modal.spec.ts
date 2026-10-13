import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders title and emits closed', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'تست');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('تست');
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('[aria-label="بستن"]') as HTMLButtonElement).click();
    expect(closed).toBe(true);
  });
});
