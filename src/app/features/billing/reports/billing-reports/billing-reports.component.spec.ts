import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BillingReportsComponent } from './billing-reports.component';

describe('BillingReportsComponent', () => {
  let component: BillingReportsComponent;
  let fixture: ComponentFixture<BillingReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingReportsComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingReportsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
