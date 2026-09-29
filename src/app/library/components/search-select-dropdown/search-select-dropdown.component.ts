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
  dropdownStyles: Record<string, string> = {};
  resolvedPlacement: 'top' | 'bottom' = 'bottom';
  @Input() dropdownOptionMaxHeight:string='186px'
  /** Preferred side; the menu flips when that side does not have enough room. */
  @Input() dropdownPlacement: 'top' | 'bottom' = 'bottom';
  @Input() showPrefixOptionIcon:any=false;
  static activeInstance: SearchSelectDropdownComponent | null = null;
  static nextId = 0;
  private readonly uid = ++SearchSelectDropdownComponent.nextId;
  private positionFrame: number | null = null;
  private panelEl: HTMLElement | null = null;
  private panelParent: HTMLElement | null = null;

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
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (this.elementRef.nativeElement.contains(target) || this.panelEl?.contains(target)) {
      return;
    }
    this.closeDropdown();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    window.addEventListener('scroll', this.onViewportChange, true);
    window.addEventListener('resize', this.onViewportChange);
    window.visualViewport?.addEventListener('resize', this.onViewportChange);
    window.visualViewport?.addEventListener('scroll', this.onViewportChange);
  }

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
    this.closeDropdown();
    this.phonevalueChange.emit(this.phoneValue);
    this.selectedCountryCode.emit(this.selectedOption?.key);
  }
  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }
    if (this.isDropdownOpen) {
      this.closeDropdown();
      return;
    }
    this.openDropdown();
  }

  openDropdown(): void {
    this.filteredOptions = [...this.options];
    this.searchText = "";

    if (
      SearchSelectDropdownComponent.activeInstance &&
      SearchSelectDropdownComponent.activeInstance !== this
    ) {
      SearchSelectDropdownComponent.activeInstance.closeDropdown();
    }

    this.isDropdownOpen = true;
    SearchSelectDropdownComponent.activeInstance = this;
    this.schedulePosition();
  }

  closeDropdown(): void {
    if (!this.isDropdownOpen && SearchSelectDropdownComponent.activeInstance !== this) {
      return;
    }
    this.restorePanel();
    this.isDropdownOpen = false;
    this.dropdownStyles = {};
    this.resolvedPlacement = this.dropdownPlacement;
    if (SearchSelectDropdownComponent.activeInstance === this) {
      SearchSelectDropdownComponent.activeInstance = null;
    }
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
    this.schedulePosition();
  }

  selectOption(option: SelectOption) {
    this.selectedOption = option;
    this.emitValue(option);
    this.closeDropdown();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onViewportChange, true);
    window.removeEventListener('resize', this.onViewportChange);
    window.visualViewport?.removeEventListener('resize', this.onViewportChange);
    window.visualViewport?.removeEventListener('scroll', this.onViewportChange);
    if (this.positionFrame != null) {
      cancelAnimationFrame(this.positionFrame);
    }
    this.restorePanel();
    if (SearchSelectDropdownComponent.activeInstance === this) {
      SearchSelectDropdownComponent.activeInstance = null;
    }
  }
  get displayValue(): string {
    const match = this.options?.find((option) => String(option.key) === String(this.value));
    return match?.value?.toString() ?? '';
  }
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

  this.searchText = "";
  this.closeDropdown();
}
  trackOptions = (index: number, option: any) => option.key;

  get resolvedPlaceholder(): string {
    return resolveFieldPlaceholder(this.fieldTitle, this.placeholder, 'select');
  }

  private readonly onViewportChange = (): void => {
    if (this.isDropdownOpen) {
      this.schedulePosition();
    }
  };

  private schedulePosition(): void {
    if (this.positionFrame != null) {
      cancelAnimationFrame(this.positionFrame);
    }
    this.positionFrame = requestAnimationFrame(() => {
      this.positionFrame = null;
      this.positionDropdown();
    });
  }

  private getTriggerElement(): HTMLElement | null {
    const host = this.elementRef.nativeElement;
    return host.querySelector(
      this.isPhoneMode
        ? '.select-wrapper_phone-field'
        : '.select-wrapper_select-field',
    );
  }

  private getPanelElement(): HTMLElement | null {
    return this.panelEl
      ?? this.elementRef.nativeElement.querySelector('.select-wrapper__dropdown');
  }

  private attachPanelToBody(): HTMLElement | null {
    const panel = this.getPanelElement();
    if (!panel) {
      return null;
    }
    this.panelEl = panel;
    if (panel.parentElement !== document.body) {
      this.panelParent = panel.parentElement;
      document.body.appendChild(panel);
    }
    return panel;
  }

  private restorePanel(): void {
    const panel = this.panelEl ?? this.getPanelElement();
    if (panel && this.panelParent && panel.parentElement === document.body) {
      this.panelParent.appendChild(panel);
    }
    this.panelEl = null;
    this.panelParent = null;
  }

  private parseMaxOptionHeight(): number {
    const parsed = parseInt(String(this.dropdownOptionMaxHeight), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 186;
  }

  positionDropdown(): void {
    const trigger = this.getTriggerElement();
    if (!trigger || !this.isDropdownOpen) {
      return;
    }
    this.attachPanelToBody();

    const triggerRect = trigger.getBoundingClientRect();
    const gap = 4;
    const padding = 8;
    const searchHeight = this.searchFunctionality ? 48 : 0;
    const createNewHeight = this.createNew ? 40 : 0;
    const panelChrome = 16;
    const preferredHeight = Math.min(
      320,
      searchHeight + this.parseMaxOptionHeight() + createNewHeight + panelChrome,
    );

    const spaceBelow = window.innerHeight - triggerRect.bottom - gap - padding;
    const spaceAbove = triggerRect.top - gap - padding;
    const minUsefulHeight = 120;

    let placement = this.dropdownPlacement;
    if (placement === 'bottom' && spaceBelow < minUsefulHeight && spaceAbove > spaceBelow) {
      placement = 'top';
    } else if (placement === 'top' && spaceAbove < minUsefulHeight && spaceBelow > spaceAbove) {
      placement = 'bottom';
    }
    this.resolvedPlacement = placement;

    const available = Math.max(minUsefulHeight, placement === 'bottom' ? spaceBelow : spaceAbove);
    const maxHeight = Math.round(Math.min(preferredHeight, available));

    let left = triggerRect.left;
    let width = triggerRect.width;
    if (left + width > window.innerWidth - padding) {
      width = Math.max(160, window.innerWidth - left - padding);
    }
    if (left < padding) {
      width = Math.min(width, window.innerWidth - padding * 2);
      left = padding;
    }

    this.dropdownStyles = {
      position: 'fixed',
      top: placement === 'bottom' ? `${Math.round(triggerRect.bottom + gap)}px` : 'auto',
      bottom: placement === 'top' ? `${Math.round(window.innerHeight - triggerRect.top + gap)}px` : 'auto',
      left: `${Math.round(left)}px`,
      width: `${Math.round(width)}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: '11000',
    };
  }
}
