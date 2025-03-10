import { TestBed } from '@angular/core/testing';

import { SettingsDbService } from './settings-db.service';

describe('SettingsDbService', () => {
  let service: SettingsDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
