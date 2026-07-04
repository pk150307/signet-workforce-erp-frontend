import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { resolveFieldPlaceholder } from '../../utils/field-placeholder.util';

@Component({
  selector: 'signet-custom-text-area-field',
  templateUrl: './custom-text-area-field.component.html',
  styleUrl: './custom-text-area-field.component.less',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTextAreaFieldComponent),
      multi: true,
    },
  ],
})
export class CustomTextAreaFieldComponent implements ControlValueAccessor {
  @Input() limitCounterRequired: boolean = false;
  @Input() fieldTitle?: string;
  @Input() showTitle: boolean = true;
  @Input() required: boolean = false;
  @Input() width: number = 940;
  @Input() height: number = 66;
  @Input() heightUnit: 'px' | '%' | 'rem' | 'em' = 'px';
  @Input() fieldPlaceholder: string = '';
  @Input() widthUnit: 'px' | '%' | 'rem' | 'em' = 'px';
  @Input() charLimitMaxVal: number = 10000;
  @Input() textValue: string = '';
  @Input() isResizable: boolean = false;
  @Input() maxHeight: number = 0;
  @Input() minHeight: number = 0;
  @Input() disabled: boolean = false;
  @Output() textValueChange = new EventEmitter();
  isInputValid: boolean = true;
  @Input() errorMessage?: string;
  @Input() showError: boolean = false;
  @Input() validator?: Function;
  @Input() readOnly: boolean = false;
  @Input() isErrorMsgRequired: boolean = false;

  changeListener: Subject<string> = new Subject<string>();
  listenerSubscription?: Subscription;
  private onCvaChange: (value: string) => void = () => {};
  private onCvaTouched: () => void = () => {};

  constructor() {}

  ngOnDestroy(): void {
    if (this.listenerSubscription) {
      this.listenerSubscription.unsubscribe();
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.isResizable) {
        this.adjustTextAreaHeight();
      }
    }, 30);
  }

  ngOnInit(): void {
    this.listenChanges();
  }

  listenChanges() {
    this.listenerSubscription = this.changeListener
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.height = this.minHeight;
        setTimeout(() => {
          this.adjustTextAreaHeight();
        });
      });
  }

  onUpdate(value: string) {
    const isRemoved = value.length < this.textValue?.length;
    this.textValue = value;
    if (this.isResizable) {
      if (isRemoved) {
        this.changeListener.next('');
      } else {
        this.height = this.minHeight;
        this.adjustTextAreaHeight();
      }
    }
    this.textValueChange.emit(value);
    this.onCvaChange(value);
    this.onCvaTouched();
  }

  writeValue(value: string | null): void {
    this.textValue = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onCvaChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onCvaTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  disableEnter(event: any) {
    if (event.keyCode == 13) {
      event.preventDefault();
    }
  }

  adjustTextAreaHeight() {
    const textAreaRef = document.getElementById('textArea');
    if (textAreaRef) {
      const height: number = textAreaRef.scrollHeight + 35;
      if (height <= this.maxHeight) {
        this.height = height;
        textAreaRef.style.overflowY = 'hidden';
      } else {
        this.height = this.maxHeight;
        textAreaRef.style.overflowY = 'auto';
      }
      if (this.height < this.minHeight) {
        this.height = this.minHeight;
      }
    }
  }
  validateInput() {
    this.isInputValid = false;
    this.errorMessage = '';
    if (this.required && this.isValueFilled(this.textValue.toString())) {
      this.errorMessage = `"${this.fieldTitle}" is required.`;
    } else if (this.validator) {
      this.errorMessage = this.validator(this.textValue) ?? '';
    }
    if (
      this.errorMessage == null ||
      this.errorMessage == undefined ||
      this.errorMessage.length == 0
    ) {
      this.isInputValid = true;
    }
  }
  isValueFilled(value?: string) {
    return value == undefined || value == null || value.length == 0;
  }

  get resolvedPlaceholder(): string {
    return resolveFieldPlaceholder(this.fieldTitle, this.fieldPlaceholder, 'enter');
  }
}
