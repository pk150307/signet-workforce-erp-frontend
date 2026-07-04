import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  HostListener,
} from '@angular/core';
import { resolveFieldPlaceholder } from '../../utils/field-placeholder.util';

@Component({
  selector: 'signet-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrl: './multi-select-dropdown.component.less',
})
export class MultiSelectDropdownComponent {
  private static nextId = 0;
  private readonly uid = ++MultiSelectDropdownComponent.nextId;

  readonly inputId = `signet-multi-select-input-${this.uid}`;

  @Input() height: number = 46;
  @Input() heightUnit: 'px' | '%' | 'em' | 'rem' = 'px';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() value: any[] = [];
  @Input() noTextTransform: boolean = false;
  @Input() options: { key: any; value: string }[] = [
    {
      key: 1,
      value: '100',
    },
    {
      key: 2,
      value: '200',
    },
    {
      key: 3,
      value: '300',
    },
    {
      key: 4,
      value: '400',
    },
    {
      key: 5,
      value: '500',
    },
  ];
  @Input() width: number = 166;
  @Input() widthUnit: 'px' | '%' | 'em' | 'rem' = 'px';
  @Output() valueChange: EventEmitter<any[]> = new EventEmitter<any[]>();
  showDropdown: boolean = false;
  @ViewChild('SelectDropdown') dropdownRef: ElementRef | undefined;
  @ViewChild('inputField') fieldRef: ElementRef | undefined;
  allFlag: boolean = false;
  @Input() allText: string = 'All';
  @Input() showAll: boolean = true;
  @Input() fieldTitle?: string;
  @Input() required: boolean = false;
  @Input() forModal: boolean = true;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  checkAll(event: Event) {
    if (this.isAllChecked) {
      this.value = [];
    } else {
      this.value = this.options.map((option) => {
        return option.key;
      });
    }
    this.valueChange.emit(this.value);
    event.stopPropagation();
    event.preventDefault();
  }

  get isAllChecked(): boolean {
    return !(this.options ?? []).some(
      (option) => !this.value?.includes(option.key),
    );
  }

  onClick(event: Event, key: any) {
    if (
      this.value?.length == 1 &&
      (this.value[0] === null || this.value[0]?.length === 0)
    ) {
      this.value = [];
    }
    const index = this.value.findIndex((val) => val == key);
    if (index == -1) {
      this.value.push(key);
    } else {
      this.value.splice(index, 1);
    }
    this.valueChange.emit(this.value);
    event.preventDefault();
    event.stopPropagation();
  }
  openDropdown() {
    this.showDropdown = !this.showDropdown;
    this.positionDropdown();
  }

  positionDropdown() {
    if (this.dropdownRef && this.fieldRef && this.forModal) {
      const fieldRects = this.fieldRef.nativeElement.getClientRects()[0];
      this.dropdownRef.nativeElement.style.top = (fieldRects.bottom + window.scrollY) + 'px';
      this.dropdownRef.nativeElement.style.left = fieldRects.left + 'px';
      this.dropdownRef.nativeElement.style.width = fieldRects.width + 'px';
    }
  }

  ngAfterViewInit() {
    // Add click outside handler
    document.addEventListener('click', (event) => {
      const target = event?.target as HTMLElement;
      if (!this.elementRef.nativeElement.contains(target)) {
        this.showDropdown = false;
      }
    });
  }

  get displayValue(): string {
    if (this.isAllChecked && this.showAll && this.options?.length > 0) {
      return this.allText;
    }
    try {
      const selectedValues = this.value
        .map((val) => this.getOptionByKey(val)?.value)
        .filter((val) => val != null && val.length > 0);
      
      if (selectedValues.length === 0) {
        return '';
      }
      
      const joinedText = selectedValues.join(', ');
      
      // Calculate max characters based on actual field width
      const maxCharacters = this.getMaxCharactersForField();
      
      if (joinedText.length > maxCharacters) {
        const truncatedLength = Math.max(maxCharacters - 3, 1); // Reserve space for '...'
        return joinedText.substring(0, truncatedLength) + '...';
      }
      
      return joinedText;
    } catch (error) {
      this.value = [this.value];
      const selectedValues = this.value
        .map((val) => this.getOptionByKey(val)?.value)
        .filter((val) => val != null && val.length > 0);
      
      if (selectedValues.length === 0) {
        return '';
      }
      
      const joinedText = selectedValues.join(', ');
      const maxCharacters = this.getMaxCharactersForField();
      
      if (joinedText.length > maxCharacters) {
        const truncatedLength = Math.max(maxCharacters - 3, 1);
        return joinedText.substring(0, truncatedLength) + '...';
      }
      
      return joinedText;
    }
  }

  private getMaxCharactersForField(): number {
    // Calculate actual field width in pixels
    let fieldWidthPx = 0;
    
    if (this.widthUnit === '%') {
      // For percentage, calculate based on parent container width
      // Assuming parent container is the form field container
      const parentWidth = 600; // Default parent width in pixels (can be adjusted)
      fieldWidthPx = (this.width / 100) * parentWidth;
    } else {
      // For px, em, rem units
      fieldWidthPx = this.width;
    }
    
    // Account for padding and dropdown arrow
    const usableWidth = fieldWidthPx * 0.9; // 90% of field width
    const paddingAndArrow = 40; // Approximate space for padding and arrow
    const textWidth = usableWidth - paddingAndArrow;
    
    // Average character width for ProximaNova-Regular 14px is approximately 7px
    const avgCharWidth = 7;
    
    return Math.floor(textWidth / avgCharWidth);
  }

  getOptionByKey(key: any) {
    return (this.options ?? []).find((val) => val.key == key);
  }
  groupOptions(index: any, item: any) {
    return item.key;
  }

  get resolvedPlaceholder(): string {
    return resolveFieldPlaceholder(this.fieldTitle, this.placeholder, 'select');
  }
}
