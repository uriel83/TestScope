import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MonitorComponent } from './monitor.component';

describe('MonitorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MonitorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
