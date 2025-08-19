import { TestBed } from '@angular/core/testing';

import { FiltersStateService } from './filters-state-service';

describe('FiltersStateService', () => {
  let service: FiltersStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltersStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
