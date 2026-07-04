import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolDatePickerComponent } from './bol-date-picker.component';

describe('BolDatePickerComponent', () => {
  let component: BolDatePickerComponent;
  let fixture: ComponentFixture<BolDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BolDatePickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
