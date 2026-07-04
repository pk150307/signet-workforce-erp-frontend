import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BillingConfigurationListComponent } from './billing-configuration-list.component';

describe('BillingConfigurationListComponent', () => {
  let component: BillingConfigurationListComponent;
  let fixture: ComponentFixture<BillingConfigurationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingConfigurationListComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingConfigurationListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
