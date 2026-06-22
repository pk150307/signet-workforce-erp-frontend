import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SafeDatePipe } from '../../../../shared/pipes/safe-date.pipe';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeListItem } from '../../../../core/models/employee.models';
import { EmployeeAvatarComponent } from '../employee-avatar/employee-avatar.component';
import { EmployeeStatusBadgeComponent } from '../employee-status-badge/employee-status-badge.component';

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [SafeDatePipe, MatIconModule, EmployeeAvatarComponent, EmployeeStatusBadgeComponent],
  templateUrl: './employee-card.component.html',
  styleUrl: './employee-card.component.less',
})
export class EmployeeCardComponent {
  @Input({ required: true }) employee!: EmployeeListItem;
  @Input() showMeta = true;
  @Output() cardClick = new EventEmitter<string>();

  onClick() {
    this.cardClick.emit(this.employee.id);
  }
}
