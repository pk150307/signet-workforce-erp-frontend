import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DeleteApprovalsListComponent } from './delete-approvals-list.component';

describe('DeleteApprovalsListComponent', () => {
  let component: DeleteApprovalsListComponent;
  let fixture: ComponentFixture<DeleteApprovalsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteApprovalsListComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteApprovalsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
