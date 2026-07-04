import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolDateRangePickerComponent } from './bol-date-range-picker.component';

describe('BolDateRangePickerComponent', () => {
  let component: BolDateRangePickerComponent;
  let fixture: ComponentFixture<BolDateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BolDateRangePickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolDateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
