import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpFieldComponent } from './otp-field.component';

describe('OtpFieldComponent', () => {
  let component: OtpFieldComponent;
  let fixture: ComponentFixture<OtpFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtpFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
