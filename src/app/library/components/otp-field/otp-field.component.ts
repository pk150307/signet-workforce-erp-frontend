import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'signet-otp-field',
  templateUrl: './otp-field.component.html',
  styleUrl: './otp-field.component.less',
})
export class OtpFieldComponent implements OnInit, AfterViewInit{
  readonly fieldId: string;
  @Input() digitCount: number = 6;
  @Input() error?: string;
  @Output() errorChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() value?: string;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onEnter: EventEmitter<void> = new EventEmitter<void>();
  @Input() toolTipMessage: string = '';
  @Input() showError: boolean = false;
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  constructor() {
    this.fieldId = Math.random().toString(36).substring(2, 9);
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    if (this.otpInputs.first) {
      this.otpInputs.first.nativeElement.focus();
    }
  }

  onKeyUp(event: KeyboardEvent, cellIndex: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (this.value?.length == this.digitCount) {
        this.onEnter.emit();
      }
      return;
    }
    let { value: inputValue } = event.target as HTMLInputElement;
    if (event.code?.includes('Digit') || event.code?.includes('Numpad')) {
      const nextCell = document.getElementById(
        `${this.fieldId}optCell#${cellIndex + 1}`
      ) as HTMLInputElement;
      nextCell?.focus();
      nextCell?.select();
    } else if (inputValue.length == 1 && !parseInt(inputValue)) {
      const targettedCell = event.target as HTMLInputElement;
      targettedCell.value = '';
    } else if (event.code === 'Backspace' && inputValue.length == 0) {
      const prevCell = document.getElementById(
        `${this.fieldId}optCell#${cellIndex - 1}`
      ) as HTMLInputElement;
      prevCell?.focus();
      prevCell?.select();
    }
    this.onChange();
  }

  onChange() {
    let otpValue: string = '';
    for (let i = 0; i < this.digitCount; i++) {
      const cell = document.getElementById(
        `${this.fieldId}optCell#${i}`
      ) as HTMLInputElement;
      otpValue += cell.value;
    }
    if (this.value != otpValue) {
      this.error = '';
      this.errorChange.emit('');
    }
    if (otpValue.length == this.digitCount) {
      this.value = otpValue;
      this.valueChange.emit(otpValue);
    } else if (this.value != '') {
      this.value = '';
      this.valueChange.emit('');
    }
  }

  clearInput() {
    for (let i = 0; i < this.digitCount; i++) {
      const cell = document.getElementById(
        `${this.fieldId}optCell#${i}`
      ) as HTMLInputElement;
      cell.value = '';
    }
    this.value = '';
    this.valueChange.emit('');
  }
}
