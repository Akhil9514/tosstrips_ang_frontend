import { TestBed } from '@angular/core/testing';

import { RequestingLocationService } from './requesting-location.service';

describe('RequestingLocationService', () => {
  let service: RequestingLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestingLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
