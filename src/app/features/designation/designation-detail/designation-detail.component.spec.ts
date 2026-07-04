import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DesignationDetailComponent } from './designation-detail.component';

describe('DesignationDetailComponent', () => {
  let component: DesignationDetailComponent;
  let fixture: ComponentFixture<DesignationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DesignationDetailComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignationDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
