import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeDetail, EMPLOYEE_STATUS_LABELS, GENDER_LABELS, EMPLOYMENT_TYPE_LABELS } from '../../../core/models/employee.models';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.less',
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly employee = signal<EmployeeDetail | null>(null);
  readonly statusLabels = EMPLOYEE_STATUS_LABELS;
  readonly genderLabels = GENDER_LABELS;
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;

  activeTab = 0;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.employeeService.getById(id).subscribe({
      next: (emp) => { this.employee.set(emp); this.loading.set(false); },
      error: () => { this.notification.error('Employee not found.'); this.router.navigate(['/employees']); }
    });
  }

  getStatusClass(status: number): string {
    const map: Record<number, string> = { 1: 'active', 2: 'inactive', 3: 'onleave', 4: 'terminated', 5: 'inactive', 6: 'probation' };
    return map[status] ?? '';
  }
}
