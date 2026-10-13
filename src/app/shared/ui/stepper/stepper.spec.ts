import { TestBed } from '@angular/core/testing';
import { Stepper } from './stepper';

describe('Stepper', () => {
  it('renders labels and highlights the current step', () => {
    const fixture = TestBed.createComponent(Stepper);
    fixture.componentRef.setInput('labels', ['یک', 'دو', 'سه']);
    fixture.componentRef.setInput('step', 1);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('دو');
  });
});
