import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PhotoBoothComponent } from './photo-booth.component';

describe('PhotoBoothComponent', () => {
  let component: PhotoBoothComponent;
  let fixture: ComponentFixture<PhotoBoothComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoBoothComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoBoothComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
