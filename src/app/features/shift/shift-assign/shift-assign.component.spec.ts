import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ShiftAssignComponent } from './shift-assign.component';

describe('ShiftAssignComponent', () => {
  let component: ShiftAssignComponent;
  let fixture: ComponentFixture<ShiftAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftAssignComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ShiftAssignComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
