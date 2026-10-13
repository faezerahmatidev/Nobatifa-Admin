import { TestBed } from '@angular/core/testing';
import { Banner } from './banner';
import { Switch } from '../switch/switch';

describe('Banner', () => {
  it('renders text with tone', () => {
    const fixture = TestBed.createComponent(Banner);
    fixture.componentRef.setInput('text', 'راهنما');
    fixture.componentRef.setInput('tone', 'warning');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('راهنما');
    expect(el.querySelector('p')?.className).toContain('bg-warning-pale');
  });
});

describe('Switch', () => {
  it('toggles checked with aria state', () => {
    const fixture = TestBed.createComponent(Switch);
    fixture.componentRef.setInput('label', 'تعویض روغن');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      '[role="switch"]',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-checked')).toBe('false');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-checked')).toBe('true');
  });
});
