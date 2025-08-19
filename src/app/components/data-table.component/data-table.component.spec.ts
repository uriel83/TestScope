// data-table.component.simple.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DataTableComponent } from './data-table.component';
import { TraineesService } from '../../services/trainees.service';
import { FiltersStateService } from '../../services/filters-state-service';
import { MatDialog } from '@angular/material/dialog';

// --- Mocks הכי מינימליים ---
class MockTraineesService {
  private _records = [
    { id: 1, idTrainee: 10, name: 'Alice', grade: 90, email: '', examDate: new Date(), address: '', city: '', country: '', zip: '', subject: 'Math' },
    { id: 2, idTrainee: 11, name: 'Bob',   grade: 70, email: '', examDate: new Date(), address: '', city: '', country: '', zip: '', subject: 'Science' },
  ];
  records() { return this._records; }
  subjectList() { return ['Math', 'Science']; }
  traineeList() { return [{ idTrainee: 10, name: 'Alice' }, { idTrainee: 11, name: 'Bob' }]; }
  update(_: any) {}
  add(_: any) {}
  remove(_: any) {}
}

class MockFiltersStateService {
  activeFiltersData() {
    return { subjects: [], traineeIds: [], dateFrom: null, dateTo: null, gradeMin: null, gradeMax: null };
  }
  clearFiltersData() {}
}

class MockMatDialog {
  open() { return { afterClosed: () => ({ subscribe() {} }) }; }
}

describe('DataTableComponent (simple)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: TraineesService, useClass: MockTraineesService },
        { provide: FiltersStateService, useClass: MockFiltersStateService },
        { provide: MatDialog, useClass: MockMatDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('filteredRecords without filters returns all records', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    expect(cmp.filteredRecords().length).toBe(2);
  });

  it('selectRecord toggles selection', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    const first = cmp.records()[0];
    cmp.selectRecord(first);
    expect(cmp.selected()).toBe(first);
    cmp.selectRecord(first);
    expect(cmp.selected()).toBeNull();
  });
});
