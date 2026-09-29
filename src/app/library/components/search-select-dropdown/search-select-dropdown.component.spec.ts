import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SearchSelectDropdownComponent } from './search-select-dropdown.component';

describe('SearchSelectDropdownComponent', () => {
  let component: SearchSelectDropdownComponent;
  let fixture: ComponentFixture<SearchSelectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchSelectDropdownComponent],
      imports: [FormsModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSelectDropdownComponent);
    component = fixture.componentInstance;
    component.options = [
      { key: '1', value: 'Alpha' },
      { key: '2', value: 'Beta' },
    ];
    fixture.detectChanges();
  });

  afterEach(() => {
    component.closeDropdown();
    SearchSelectDropdownComponent.activeInstance = null;
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pin the menu to the trigger with fixed positioning', () => {
    const trigger = fixture.nativeElement.querySelector('.select-wrapper_select-field') as HTMLElement;
    spyOn(trigger, 'getBoundingClientRect').and.returnValue({
      top: 120,
      bottom: 160,
      left: 40,
      right: 340,
      width: 300,
      height: 40,
      x: 40,
      y: 120,
      toJSON: () => ({}),
    });

    component.openDropdown();
    fixture.detectChanges();
    component.positionDropdown();
    fixture.detectChanges();

    expect(component.isDropdownOpen).toBeTrue();
    expect(component.dropdownStyles['position']).toBe('fixed');
    expect(component.dropdownStyles['left']).toBe('40px');
    expect(component.dropdownStyles['width']).toBe('300px');
    expect(component.dropdownStyles['top']).toBe('164px');
    expect(component.resolvedPlacement).toBe('bottom');
    expect(document.body.contains(
      document.body.querySelector('.select-wrapper__dropdown--open'),
    )).toBeTrue();
  });

  it('should flip the menu above the field when there is no room below', () => {
    const trigger = fixture.nativeElement.querySelector('.select-wrapper_select-field') as HTMLElement;
    spyOn(trigger, 'getBoundingClientRect').and.returnValue({
      top: window.innerHeight - 50,
      bottom: window.innerHeight - 10,
      left: 24,
      right: 324,
      width: 300,
      height: 40,
      x: 24,
      y: window.innerHeight - 50,
      toJSON: () => ({}),
    });

    component.openDropdown();
    fixture.detectChanges();
    component.positionDropdown();
    fixture.detectChanges();

    expect(component.resolvedPlacement).toBe('top');
    expect(component.dropdownStyles['bottom']).not.toBe('auto');
    expect(component.dropdownStyles['top']).toBe('auto');
  });

  it('should close on an outside click', () => {
    component.openDropdown();
    fixture.detectChanges();
    component.positionDropdown();

    component.onClickOutside(new MouseEvent('click'));
    fixture.detectChanges();

    expect(component.isDropdownOpen).toBeFalse();
    expect(component.dropdownStyles).toEqual({});
  });
});
