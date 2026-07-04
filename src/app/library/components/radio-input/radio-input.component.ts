import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'signet-radio-input',
  templateUrl: './radio-input.component.html',
  styleUrl: './radio-input.component.less',
})
export class RadioInputComponent {
  @Input() value: any = 1;
  @Input() options: any = [
    {
      key: 'ACTUALS',
      value: 'Actuals',
    },
    {
      key: 'BUDGET',
      value: 'Budget',
    },
  ];
  @Input() alignHorizontal: boolean = false;
  @Input() gap: string = '20px';
  @Input() disabled: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() fontSize: string = '16px';

  @Output() valueChange = new EventEmitter<any>();
  @Output() clickAction = new EventEmitter<any>();

  emitChange(selection: any) {
    this.value = selection;
    this.valueChange.emit(this.value);
  }

  emitClickAction(event: any, option?: any) {
    this.clickAction.emit(option);
  }
}
