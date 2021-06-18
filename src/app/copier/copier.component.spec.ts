import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CopierComponent } from './copier.component';

describe('CopierComponent', () => {
  let component: CopierComponent;
  let fixture: ComponentFixture<CopierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CopierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
