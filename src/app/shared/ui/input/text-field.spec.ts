import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { TextField } from './text-field';

describe('TextField', () => {
  it('shows an error when touched and invalid', () => {
    const fixture = TestBed.createComponent(TextField);
    const control = new FormControl('', { validators: [Validators.required] });
    fixture.componentRef.setInput('label', 'نام');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('error', 'الزامی است');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('الزامی است');
  });
});
