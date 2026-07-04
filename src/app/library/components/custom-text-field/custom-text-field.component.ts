import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, fromEvent, map } from 'rxjs';
import { ElementRef } from '@angular/core';
import { resolveFieldPlaceholder } from '../../utils/field-placeholder.util';

@Component({
  selector: 'signet-custom-text-field',
  templateUrl: './custom-text-field.component.html',
  styleUrl: './custom-text-field.component.less',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTextFieldComponent),
      multi: true,
    },
  ],
})
export class CustomTextFieldComponent implements ControlValueAccessor {
  subscriptions: Subscription[] = [];
  @Input() maxLength: number = 10000;
  @Input() fieldTitle?: string;
  @Input() required: boolean = true;
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' | 'number' | 'password' = 'text';
  @Input() value: any = '';
  @Input() autocomplete: string = 'off';
  @Input() validator?: Function;
  @Input() width: number = 100;
  @Input() suffixTextWidth: number = 100;
  @Input() widthUnit: 'px' | '%' | 'rem' | 'em' = '%';
  @Input() height: number = 76;
  @Input() heightUnit: 'px' | '%' | 'rem' | 'em' = '%';
  @Input() disabled: boolean = false;
  @Input() suffixIcon?: string;
  @Input() prefixText?: string;
  @Input() suffixText?: string;
  @Output() iconClicked = new EventEmitter();
  @Input() prefixIconWidth: string = '20px';
  @Input() prefixIconHeight: string = '20px';
  @Input() suffixIconWidth: string = '20px';
  @Input() suffixIconHeight: string = '20px';
  @Input() prefixIcon?: string;
  @Output() valueChange = new EventEmitter<string | number>();
  @Output() dropdownChange = new EventEmitter<string | number>();
  @Input() errorMessage?: string;
  @Input() charLimitError: string = '';
  @Input() showError: boolean = false;
  @Input() disableInput: boolean = false;
  @Input() commaSeparator?: boolean = false;
  @Input() allowNegative?: boolean = true;
  @Input() includeErrorMsgPaddingFlag: boolean = true;
  @Input() paddingLeftHostSponsor: boolean = false;
  @Input() toolTipMessage: string = '';
  @Input() tooltipWidth: number = 285;
  @Input() tooltipHeight: number = 65;
  @Input() suffixWidth: number = 5;
  @Input() suffixTextAlign: string = 'end';
  @Input() fieldColor: string = 'transparent';
  @Input() isCentreAlign: boolean = false;
  @Input() selectDropdownConfig?: {
    selectedValue: any;
    width: number;
    placeholder: string;
    options: {
      key: string | number;
      value: string | number;
    }[];
    onChange?: Function;
  };
  @Input() highlightOnFocus: string = '';
  @Input() autofocusField: boolean = false;
  @Input() defaultFocus: boolean = false;
  @Input() focusBorder: string = '#dfe6ea';
  @Input() focusBorderToolTip: boolean = false;

  isInputValid: boolean = true;
  randomNumber: number = 12;
  private onCvaChange: (value: string | number) => void = () => {};
  private onCvaTouched: () => void = () => {};
  @Input() readOnly: boolean = false;
  @Input() disableFieldOnly: boolean = false;
  @Input() disableEdit: boolean = false;
  @Input() urlDropdownField: boolean = false;
  @Input() whiteSpacesNotAllowed: boolean = false;
  @Input() delay?: number = 0;
  @Input() escapeCharacters: any = [];
  @Input() restrictDecimal: boolean = false;
  @Input() prefixIconClickable = false;
  @Input() hideTitle: boolean = false;
  @Output() onBlur: EventEmitter<void> = new EventEmitter<void>();
  @Output() onEnter: EventEmitter<any> = new EventEmitter<any>();
  @Output() prefixIconClicked: EventEmitter<any> = new EventEmitter<any>();
  handleWheelRef: any;
  constructor(public elementRef: ElementRef) {}

  ngOnInit(): void {
    this.listenChanges();
    this.generateRandomNumber();
    if (this.type === 'number' && this.commaSeparator) {
      this.onUpdate(this.value);
    }
  }

  iconClick() {
    this.iconClicked.emit({});
  }
  formatValue(inputValue: string): string | undefined {
    if (
      this.type == 'number' &&
      this.commaSeparator &&
      inputValue?.length > 0
    ) {
      let integerPart = inputValue.replace(/,/g, '');

      let parts = integerPart.split('.');
      let formattedIntegerPart = parts[0];
      let decimalPart = parts.length > 1 ? parts[1] : '';

      formattedIntegerPart = formattedIntegerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ','
      );

      let formattedValue =
        formattedIntegerPart + (decimalPart ? '.' + decimalPart : '');

      return formattedValue;
    }
    return inputValue ?? '';
  }
  onUpdate(event: string | number) {
    this.value = event;
    if (this.type == 'number' && event?.toString()?.length > 0) {
      this.value = event.toString().replace(/[^-0-9.]/g, '');
      // Ensure there is only one '-' at the beginning (for negative numbers)
      if (this.value.startsWith('-') && this.allowNegative) {
        this.value = '-' + this.value.replace(/-/g, '');
      } else {
        this.value = this.value.replace(/-/g, '');
      }

      if (this.restrictDecimal) {
        this.value = this.value.split('.')[0];
      } else {
        this.value = this.value.replace(/(\..*)\./g, '$1');
      }

      // Ensure there is only one '.' in the number
      this.value = this.value.replace(/(\..*)\./g, '$1');
      if (!this.commaSeparator) {
        const ele: any = this.inputFieldRef?.nativeElement;
        ele.value = this.value;
      } else {
        const startCursorPosition =
          this.inputFieldRef?.nativeElement?.selectionStart;

        const endCursorPosition =
          this.inputFieldRef?.nativeElement?.selectionEnd;

        if (endCursorPosition - startCursorPosition == 1) {
          setTimeout(() => {
            this.inputFieldRef?.nativeElement?.setSelectionRange(
              endCursorPosition,
              endCursorPosition
            );
          }, 0);
        }
      }
    }
    if (this.type == 'text' && this.whiteSpacesNotAllowed) {
      this.value = this.value.replace(/\s/g, '');
      const ele: any = this.inputFieldRef?.nativeElement;
      ele.value = this.value;
    }
    if (this.escapeCharacters.length > 0) {
      this.escapeCharacters.forEach((char: string) => {
        this.value = this.value?.replace(new RegExp(char, 'g'), '');
        const ele: any = this.inputFieldRef?.nativeElement;
        ele.value = this.value;
      });
    }
    this.valueChange.emit(this.value);
    this.onCvaChange(this.value);
    this.onCvaTouched();
  }

  writeValue(value: string | number | null): void {
    this.value = value ?? '';
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

  listenChanges() {
    const stream = fromEvent(this.elementRef.nativeElement, 'keyup')
      .pipe(
        map(() => this.value),
        debounceTime(this.delay ?? 0)
        // distinctUntilChanged()
      )
      .subscribe((input) => {
        this.onUpdate(input);
      });
    this.subscriptions.push(stream);
  }

  // To handle comma seperator input without breaking other values

  // onUpdateCommaSeperatorValue(event: string | number) {
  //   this.value = event;
  //   this.valueChange.emit(event);
  // }
  changedDropdownValue($event: any) {
    this.dropdownChange.emit($event);
  }
  validateInput() {
    this.isInputValid = false;
    this.errorMessage = '';
    if (this.required && this.isValueFilled(this.value.toString())) {
      this.errorMessage =
        (this.fieldTitle ? `"${this.fieldTitle}" ` : `This field `) +
        `is required.`;
    } else if (this.validator) {
      this.errorMessage = this.validator(this.value) ?? '';
    }
    if (
      this.errorMessage == null ||
      this.errorMessage == undefined ||
      this.errorMessage.length == 0
    ) {
      this.isInputValid = true;
    }
  }

  generateRandomNumber() {
    this.randomNumber = Math.floor(Math.random() * 100) + 1;
  }
  onlyNumber(event: any) {
    const invalidCharacters = [
      '@',
      '#',
      '$',
      '%',
      '^',
      '&',
      '*',
      '(',
      ')',
      '!',
      '_',
      '~',
      '{',
      '}',
      '<',
      '>',
      '?',
      '|',
      '+',
      ':',
      '"',
    ];
    if (
      event.shiftKey &&
      invalidCharacters.includes(event.key) &&
      event.code !== 'Tab'
    ) {
      event.preventDefault();
    }
    if (
      event.which === 8 ||
      event.which === 37 ||
      event.which === 39 ||
      event.code === 'Tab' ||
      event.key === '.'
    ) {
      return;
    }
    if (event.key === '-') {
      if (!this.allowNegative) {
        event.preventDefault();
      } else {
        const inputElement = event.target as HTMLInputElement;
        const cursorPosition = inputElement.selectionStart;
        if (cursorPosition !== 0) {
          event.preventDefault();
        }
      }
      return;
    }
    if (event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
  }

  ngAfterViewInit() {
    this.handleWheelRef = this.handleWheel.bind(this);
    this.elementRef.nativeElement.addEventListener(
      'wheel',
      this.handleWheelRef,
      { passive: false }
    );
    setTimeout(() => {
      if (this.autofocusField && this.inputFieldRef) {
        if (this.defaultFocus) {
          this.inputFieldRef.nativeElement.focus();
          this.focusBorder = this.highlightOnFocus;
        }
      }
    }, 500);
  }

  isValueFilled(value?: string) {
    return value == undefined || value == null || value.length == 0;
  }

  handleBlur() {
    this.onBlur.emit();
    this.resetFieldStyles();
  }

  resetFieldStyles() {
    this.focusBorder = '#dfe6ea';
  }

  setBorderhighlight() {
    if (this.autofocusField) {
      this.focusBorder = this.highlightOnFocus;
    }
  }

  @ViewChild('InputField') inputFieldRef: ElementRef | undefined;

  enterClicked(event: any) {
    this.onEnter.emit(event.target.value);
  }

  public get clientRect(): any {
    return this.inputFieldRef?.nativeElement?.getClientRects();
  }

  handleWheel = (event: WheelEvent) => {
    // document.addEventListener('wheel', (event) => {
    const target = event?.target as HTMLElement;
    const inputField = document.getElementById('noscrol');
    if (event.deltaX !== 0 && target.id === 'noscrol_' + this.randomNumber) {
      event.preventDefault();
    }

    // },{ passive: false });
  };
  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener(
      'wheel',
      this.handleWheelRef
    );
    this.subscriptions.forEach((subscription) => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  }
  prefixIconClick() {
    this.prefixIconClicked.emit();
  }

  get resolvedPlaceholder(): string {
    return resolveFieldPlaceholder(this.fieldTitle, this.placeholder, 'enter');
  }
}
