import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSelectDropdownComponent } from './search-select-dropdown.component';

describe('SearchSelectDropdownComponent', () => {
  let component: SearchSelectDropdownComponent;
  let fixture: ComponentFixture<SearchSelectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchSelectDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
