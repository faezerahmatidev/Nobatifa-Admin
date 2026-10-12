import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

describe('Icon', () => {
  it('renders an svg for every icon name', () => {
    const names = [
      'dashboard',
      'appointments',
      'clock',
      'receipt',
      'settings',
      'user',
      'log-out',
      'menu',
      'x',
      'chevron-down',
    ] as const;
    for (const name of names) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [Icon] });
      const fixture = TestBed.createComponent(Icon);
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
    }
  });
});
