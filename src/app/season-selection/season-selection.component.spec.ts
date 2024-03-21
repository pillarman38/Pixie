import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonSelectionComponent } from './season-selection.component';

describe('SeasonSelectionComponent', () => {
  let component: SeasonSelectionComponent;
  let fixture: ComponentFixture<SeasonSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
