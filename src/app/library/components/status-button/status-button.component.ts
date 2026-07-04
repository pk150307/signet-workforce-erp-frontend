import { Component, Input } from '@angular/core';
import {
  StatusButtonData,
  StatusTone,
  resolveStatusColor,
  statusToneColor,
  toStatusButtonData,
} from '../../utils/status-tone.util';

@Component({
  selector: 'signet-status-button',
  templateUrl: './status-button.component.html',
  styleUrl: './status-button.component.less',
})
export class StatusButtonComponent {
  /** Preferred API: display label */
  @Input() label = '';
  /** Optional status key/boolean used for tone resolution */
  @Input() status: string | number | boolean | null = null;
  /** Optional explicit tone override */
  @Input() tone: StatusTone | null = null;
  /** Legacy API */
  @Input() statusData: StatusButtonData = { color: '', value: '' };
  @Input() size: 'sm' | 'md' = 'md';

  get resolved(): StatusButtonData {
    if (this.statusData?.value) {
      return {
        value: this.statusData.value,
        color: this.statusData.color || resolveStatusColor(this.statusData.value),
      };
    }

    const data = toStatusButtonData(this.label, this.status);
    if (this.tone) {
      return {
        value: data.value,
        color: statusToneColor(this.tone),
      };
    }
    return data;
  }
}
