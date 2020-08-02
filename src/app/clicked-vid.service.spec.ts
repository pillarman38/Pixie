import { TestBed } from '@angular/core/testing';

import { ClickedVidService } from './clicked-vid.service';

describe('ClickedVidService', () => {
  let service: ClickedVidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickedVidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
