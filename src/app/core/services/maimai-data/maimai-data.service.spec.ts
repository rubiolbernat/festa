import { TestBed } from '@angular/core/testing';

import { MaimaiDataService } from './maimai-data.service';

describe('MaimaiDataService', () => {
  let service: MaimaiDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaimaiDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
