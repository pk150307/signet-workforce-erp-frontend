import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'signet-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrl: './toggle-switch.component.less',
})
export class ToggleSwitchComponent {
  @Input() checked: boolean = false;
  @Input() toggleName: string = 'Enabled';
  @Output() toggle = new EventEmitter<boolean>();
  onToggleClick() {
    this.checked = !this.checked;
    this.toggle.emit(this.checked);
  }
}
