import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EmployeeListItem, EMPLOYEE_STATUS_LABELS } from '../../../../core/models/employee.models';

@Component({
  selector: 'app-employee-card',
  templateUrl: './employee-card.component.html',
  styleUrl: './employee-card.component.less',
})
export class EmployeeCardComponent {
  @Input({ required: true }) employee!: EmployeeListItem;
  @Input() showMeta = true;
  @Output() cardClick = new EventEmitter<string>();

  readonly statusLabels = EMPLOYEE_STATUS_LABELS;

  onClick() {
    this.cardClick.emit(this.employee.id);
  }
}
