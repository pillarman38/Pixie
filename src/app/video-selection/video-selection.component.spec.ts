import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VideoSelectionComponent } from './video-selection.component';

describe('VideoSelectionComponent', () => {
  let component: VideoSelectionComponent;
  let fixture: ComponentFixture<VideoSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
