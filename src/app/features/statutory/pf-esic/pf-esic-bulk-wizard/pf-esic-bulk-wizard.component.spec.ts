import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PfEsicBulkWizardComponent } from './pf-esic-bulk-wizard.component';

describe('PfEsicBulkWizardComponent', () => {
  let component: PfEsicBulkWizardComponent;
  let fixture: ComponentFixture<PfEsicBulkWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfEsicBulkWizardComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PfEsicBulkWizardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
