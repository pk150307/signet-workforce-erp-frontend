import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'signet-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.less',
})
export class ButtonComponent {
  @Input() displayText = '';
  @Input() type:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'stroke'
    | 'disabled'
    | 'warning'
    | 'disabledButton'
    | 'plane'
    | 'action'
    | 'facebook'
    | 'hollow' = 'default';
  @Input() fontSize: number = 14;
  @Input() fontSizeUnit: 'px' | '%' | 'em' | 'rem' = 'px';
  @Input() fontColor: string = '';
  @Input() disabled: boolean = false;
  @Input() showBorder: boolean = true;
  @Input() width: number = 100;
  @Input() widthUnit: 'px' | '%' | 'em' | 'rem' = '%';
  @Input() height: number = 41;
  @Input() heightUnit: 'px' | '%' | 'em' | 'rem' = 'px';
  @Input() showIcon: boolean = false;
  @Input() imageUrl: string = '';
  @Input() imageIconWidth: string = '16px';
  @Input() imageIconHeight: string = '16px';
  @Input() borderColor: string = '';
  @Output() clicked = new EventEmitter();
  @Input() enablePartialBold: boolean = false;

  onClick() {
    this.clicked.emit();
  }
}
