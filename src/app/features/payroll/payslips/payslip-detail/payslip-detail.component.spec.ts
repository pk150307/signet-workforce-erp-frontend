import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PayslipDetailComponent } from './payslip-detail.component';

describe('PayslipDetailComponent', () => {
  let component: PayslipDetailComponent;
  let fixture: ComponentFixture<PayslipDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayslipDetailComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PayslipDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
