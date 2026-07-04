import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTextAreaFieldComponent } from './custom-text-area-field.component';

describe('CustomTextAreaFieldComponent', () => {
  let component: CustomTextAreaFieldComponent;
  let fixture: ComponentFixture<CustomTextAreaFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTextAreaFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTextAreaFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
