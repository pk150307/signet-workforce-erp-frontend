import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PayslipGenerateComponent } from './payslip-generate.component';

describe('PayslipGenerateComponent', () => {
  let component: PayslipGenerateComponent;
  let fixture: ComponentFixture<PayslipGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayslipGenerateComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PayslipGenerateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
