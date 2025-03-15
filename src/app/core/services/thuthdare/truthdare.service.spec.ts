import { TestBed } from '@angular/core/testing';

import { TruthdareService } from './truthdare.service';

describe('TruthdareService', () => {
  let service: TruthdareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TruthdareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
