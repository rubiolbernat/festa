import { TestBed } from '@angular/core/testing';

import { DrinkingDataService } from './drinking-data.service';

describe('DrinkingDataService', () => {
  let service: DrinkingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrinkingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
