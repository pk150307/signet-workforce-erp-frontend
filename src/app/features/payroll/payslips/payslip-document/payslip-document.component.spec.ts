import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PayslipDocumentComponent } from './payslip-document.component';

describe('PayslipDocumentComponent', () => {
  let component: PayslipDocumentComponent;
  let fixture: ComponentFixture<PayslipDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayslipDocumentComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PayslipDocumentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
