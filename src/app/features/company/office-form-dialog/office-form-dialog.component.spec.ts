import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OfficeFormDialogComponent } from './office-form-dialog.component';

describe('OfficeFormDialogComponent', () => {
  let component: OfficeFormDialogComponent;
  let fixture: ComponentFixture<OfficeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OfficeFormDialogComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            office: null,
            branches: [
              {
                id: 'branch-1',
                branchCode: 'BR-TST',
                branchName: 'Test Branch',
                city: 'Mumbai',
                state: 'Maharashtra',
                headCount: 0,
                isActive: true,
              },
            ],
          },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OfficeFormDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
