import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { resolveFieldPlaceholder } from '../../utils/field-placeholder.util';

interface SelectOption {
  key: string;
  value: string;
  flag?: string;
  code?: string;
}

@Component({
  selector: 'signet-search-select-dropdown',
  templateUrl: './search-select-dropdown.component.html',
  styleUrl: './search-select-dropdown.component.less',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchSelectDropdownComponent),
      multi: true,
    },
  ],
})
export class SearchSelectDropdownComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() disabled: boolean = false;
  @Input() createNew: boolean = false;
  @Input() value: any = "";
  @Input() phoneValue: any = "";
  @Input() isPhoneMode: boolean = false;
  @Input() required = true;
  @Input() searchFunctionality = true;
  @Input() placeholder: string = "";
  @Input() countryCode?: string;
  @Input() options: SelectOption[] = [];
  @Output() valueChange = new EventEmitter<string | number | SelectOption>();
  @Output() createNewValueChange = new EventEmitter<{
    key: string;
    value: string;
  }>();
  @Input() width: number = 250;
  @Input() widthUnit: "px" | "%" | "em" | "rem" = "px";
  @Input() fieldTitle: string = "Role";
  @Input() phonePlaceholder: string = "";
  @Output() phonevalueChange = new EventEmitter<string>();
  @Output() selectedCountryCode = new EventEmitter<string>();
  @Input() addPrefixImage: boolean = false;
  @Input() prefixImageRounded: boolean = false;
  @Input() prefixImage: string =
    "/assets/images/icons/program-setup/cash-line_fade.png";
  searchText: string = "";
  isDropdownOpen: boolean = false;
  filteredOptions: SelectOption[] = [];
  selectedOption: SelectOption | null = null;
  @Input() dropdownOptionMaxHeight:string='186px'
  @Input() showPrefixOptionIcon:any=false;
  static activeInstance: SearchSelectDropdownComponent | null = null;
  static nextId = 0;
  private readonly uid = ++SearchSelectDropdownComponent.nextId;

  readonly phoneInputId = `signet-phone-input-${this.uid}`;

  private onCvaChange: (value: string | number) => void = () => {};
  private onCvaTouched: () => void = () => {};

  writeValue(value: string | number | null): void {
    this.value = value ?? '';
    this.syncSelectedOption();
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onCvaChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onCvaTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private syncSelectedOption(): void {
    if (this.isPhoneMode) {
      this.setSelectedOption();
      return;
    }
    this.selectedOption =
      this.options.find((option) => String(option.key) === String(this.value)) ?? null;
  }

  private emitValue(option: SelectOption): void {
    const parsed = this.coerceKey(option.key);
    this.value = parsed;
    this.onCvaChange(parsed);
    this.onCvaTouched();
    this.valueChange.emit(this.isPhoneMode ? option : parsed);
  }

  private coerceKey(key: string): string | number {
    return /^\d+$/.test(key) ? Number(key) : key;
  }

  @HostListener("document:click", ["$event"])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as HTMLElement)) {
      this.isDropdownOpen = false;

      // Deregister if this was the active dropdown
      if (SearchSelectDropdownComponent.activeInstance === this) {
        SearchSelectDropdownComponent.activeInstance = null;
      }
    }
  }
  constructor(private elementRef: ElementRef) {}

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes["options"]) {
      this.filteredOptions = [...this.options];
      this.syncSelectedOption();
      if (this.isPhoneMode) {
        this.setSelectedOption();
      }
    }
    if (changes['value']) {
      this.syncSelectedOption();
    }
  }
  setSelectedOption(): void {
    this.selectedOption =
      this.options.find((option: any) => {
        return option.key == this.countryCode;
      }) || null;
  }

  onPhoneChange() {
    this.isDropdownOpen = false;
    this.phonevalueChange.emit(this.phoneValue);
    this.selectedCountryCode.emit(this.selectedOption?.key);
  }
  toggleDropdown(): void {
    const isOpening = !this.isDropdownOpen;
    this.filteredOptions = [...this.options];
    this.searchText = "";

    // Close any previously open dropdown
    if (
      isOpening &&
      SearchSelectDropdownComponent.activeInstance &&
      SearchSelectDropdownComponent.activeInstance !== this
    ) {
      SearchSelectDropdownComponent.activeInstance.isDropdownOpen = false;
    }

    this.isDropdownOpen = isOpening;

    // Register current instance as active
    SearchSelectDropdownComponent.activeInstance = isOpening ? this : null;
    // this.positionDropdown();
  }
  onSearchChange(value: string) {
    this.searchText = value;

    this.filteredOptions = this.options.filter((opt) => {
      const valueMatch = opt.value.toLowerCase().includes(value.toLowerCase());
      const codeMatch =
        this.isPhoneMode &&
        opt.code?.toLowerCase().includes(value.toLowerCase());

      return valueMatch || codeMatch;
    });
  }

  selectOption(option: SelectOption) {
    this.selectedOption = option;
    this.emitValue(option);
    this.isDropdownOpen = false;
  }

  ngOnDestroy(): void {
    if (SearchSelectDropdownComponent.activeInstance === this) {
      SearchSelectDropdownComponent.activeInstance = null;
    }
  }
  get displayValue(): string {
    const match = this.options?.find((option) => String(option.key) === String(this.value));
    return match?.value?.toString() ?? '';
  }
  // onCreateNew() {
  //   if (!this.searchText || this.searchText.trim() === "") {
  //     return; // nothing to add
  //   }

  //   // Prepare new option
  //   const newOption = {
  //     key: this.searchText.trim().replace(/\s+/g, "_").toUpperCase(), // generate key
  //     value: this.searchText.trim(),
  //   };

  //   // Push into options
  //   this.options = [...this.options, newOption];

  //   // Update selection
  //   this.value = newOption.key;

  //   // Emit to parent
  //   this.createNewValueChange.emit(newOption);

  //   // Reset search and close dropdown
  //   this.searchText = "";
  //   this.isDropdownOpen = false;
  // }
  onCreateNew() {
  if (!this.searchText || this.searchText.trim() === "") {
    return;
  }

  const newOption = {
    key: this.searchText.trim().replace(/\s+/g, "_").toUpperCase(),
    value: this.searchText.trim(),
  };

  // 👉 Just emit to parent
  this.createNewValueChange.emit(newOption);

  // Reset search and close dropdown
  this.searchText = "";
  this.isDropdownOpen = false;
}
  trackOptions = (index: number, option: any) => option.key;

  get resolvedPlaceholder(): string {
    return resolveFieldPlaceholder(this.fieldTitle, this.placeholder, 'select');
  }
}
