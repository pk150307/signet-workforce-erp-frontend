import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InvoicePrintComponent } from './invoice-print.component';

describe('InvoicePrintComponent', () => {
  let component: InvoicePrintComponent;
  let fixture: ComponentFixture<InvoicePrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoicePrintComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicePrintComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
