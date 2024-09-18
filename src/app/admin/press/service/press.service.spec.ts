import { TestBed } from '@angular/core/testing';

import { PressService } from './press.service';

describe('PressService', () => {
  let service: PressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
