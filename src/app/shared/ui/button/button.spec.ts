import { TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  it('applies variant, size and full width', () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('bg-danger-base');
    expect(button.className).toContain('h-12');
    expect(button.className).toContain('w-full');
  });

  it('disables the native button', () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
