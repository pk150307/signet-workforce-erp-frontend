import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BillingConfigurationFormComponent } from './billing-configuration-form.component';

describe('BillingConfigurationFormComponent', () => {
  let component: BillingConfigurationFormComponent;
  let fixture: ComponentFixture<BillingConfigurationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingConfigurationFormComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingConfigurationFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
