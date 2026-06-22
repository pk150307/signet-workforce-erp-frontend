import { Component, Input } from '@angular/core';
import { EmployeeStatus, EMPLOYEE_STATUS_LABELS } from '../../../../core/models/employee.models';

@Component({
  selector: 'app-employee-status-badge',
  standalone: true,
  templateUrl: './employee-status-badge.component.html',
  styleUrl: './employee-status-badge.component.less',
})
export class EmployeeStatusBadgeComponent {
  @Input({ required: true }) status!: EmployeeStatus;

  readonly labels = EMPLOYEE_STATUS_LABELS;

  get statusClass(): string {
    const map: Record<EmployeeStatus, string> = {
      [EmployeeStatus.Draft]: 'draft',
      [EmployeeStatus.Active]: 'active',
      [EmployeeStatus.Left]: 'left',
      [EmployeeStatus.Rejoined]: 'rejoined',
    };
    return map[this.status] ?? 'draft';
  }
}
