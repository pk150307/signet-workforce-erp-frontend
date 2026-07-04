import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BillingPrerequisitesComponent } from './billing-prerequisites.component';

describe('BillingPrerequisitesComponent', () => {
  let component: BillingPrerequisitesComponent;
  let fixture: ComponentFixture<BillingPrerequisitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingPrerequisitesComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingPrerequisitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
