import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SettingsSubnavComponent } from './settings-subnav.component';

describe('SettingsSubnavComponent', () => {
  let component: SettingsSubnavComponent;
  let fixture: ComponentFixture<SettingsSubnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsSubnavComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsSubnavComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
