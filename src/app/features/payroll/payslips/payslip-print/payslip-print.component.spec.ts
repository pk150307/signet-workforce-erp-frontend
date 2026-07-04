import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PayslipPrintComponent } from './payslip-print.component';

describe('PayslipPrintComponent', () => {
  let component: PayslipPrintComponent;
  let fixture: ComponentFixture<PayslipPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayslipPrintComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PayslipPrintComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
