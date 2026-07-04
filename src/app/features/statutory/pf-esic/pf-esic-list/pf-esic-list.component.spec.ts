import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PfEsicListComponent } from './pf-esic-list.component';

describe('PfEsicListComponent', () => {
  let component: PfEsicListComponent;
  let fixture: ComponentFixture<PfEsicListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfEsicListComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PfEsicListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
