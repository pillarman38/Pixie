import { TestBed } from '@angular/core/testing';

import { PhotoViewService } from './photo-view.service';

describe('PhotoViewService', () => {
  let service: PhotoViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
