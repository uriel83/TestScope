import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should render title in DOM', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const h1 = (fixture.nativeElement as HTMLElement)
      .querySelector('.app-title')?.textContent?.trim() ?? '';
    expect(h1).toContain('TestScope');
  });
});
