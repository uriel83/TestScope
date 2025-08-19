import { TestBed } from '@angular/core/testing';
import { BaseChartDirective } from 'ng2-charts';

import 'chart.js/auto';
import { ChartWidgetComponent } from './chart-widget.component';

describe('ChartWidgetComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartWidgetComponent, BaseChartDirective],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ChartWidgetComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
