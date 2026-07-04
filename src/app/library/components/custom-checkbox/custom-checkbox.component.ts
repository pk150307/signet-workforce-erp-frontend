import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'signet-custom-checkbox',
  templateUrl: './custom-checkbox.component.html',
  styleUrl: './custom-checkbox.component.less',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCheckboxComponent),
      multi: true,
    },
  ],
})
export class CustomCheckboxComponent implements ControlValueAccessor {
  @Input() permissionKey = '';
  @Input() label!: string;
  @Input() required = false;
  @Input() checked = false;
  @Input() rounded = false;
  @Input() marginRightZero = false;
  @Input() groupName = 'default';
  @Input() disabled = false;

  @Output() permissionToggled = new EventEmitter<{
    key: string;
    checked: boolean;
  }>();

  private onCvaChange: (value: boolean) => void = () => {};
  private onCvaTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onCvaChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onCvaTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange(e: Event) {
    if (this.disabled) {
      return;
    }
    this.checked = !this.checked;

    const input = e.target as HTMLInputElement;
    this.permissionToggled.emit({
      key: this.permissionKey,
      checked: input.checked,
    });
    this.onCvaChange(input.checked);
    this.onCvaTouched();
  }
}
