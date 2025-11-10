import { TestBed } from '@angular/core/testing';

import { TourntripCountryService } from './tourntrip-country.service';

describe('TourntripCountryService', () => {
  let service: TourntripCountryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourntripCountryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
