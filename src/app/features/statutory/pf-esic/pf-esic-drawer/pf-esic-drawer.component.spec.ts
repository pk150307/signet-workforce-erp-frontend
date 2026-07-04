import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PfEsicDrawerComponent } from './pf-esic-drawer.component';

describe('PfEsicDrawerComponent', () => {
  let component: PfEsicDrawerComponent;
  let fixture: ComponentFixture<PfEsicDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfEsicDrawerComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PfEsicDrawerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
