import { TestBed } from '@angular/core/testing';
import { LoadingState } from './loading-state';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { AccessDeniedState } from './access-denied-state';

describe('Shared states', () => {
  it('renders loading status', () => {
    const fixture = TestBed.createComponent(LoadingState);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]'),
    ).toBeTruthy();
  });

  it('renders empty title and message', () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('title', 'موردی نیست');
    fixture.componentRef.setInput('message', 'توضیح');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('موردی نیست');
    expect(el.textContent).toContain('توضیح');
  });

  it('renders error with retry', () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('message', 'خطا');
    fixture.detectChanges();
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    ((fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement).click();
    expect(retried).toBe(true);
  });

  it('renders access denied', () => {
    const fixture = TestBed.createComponent(AccessDeniedState);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('دسترسی ندارید');
  });
});
