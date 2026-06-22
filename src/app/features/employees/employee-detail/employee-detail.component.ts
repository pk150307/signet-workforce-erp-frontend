import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { EmployeeDetail, EMPLOYEE_STATUS_LABELS, GENDER_LABELS, EMPLOYMENT_TYPE_LABELS } from '../../../core/models/employee.models';
import { SafeDatePipe } from '../../../shared/pipes/safe-date.pipe';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgClass,
    SafeDatePipe,
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
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly apiUnavailable = signal(false);
  readonly employee = signal<EmployeeDetail | null>(null);
  readonly statusLabels = EMPLOYEE_STATUS_LABELS;
  readonly genderLabels = GENDER_LABELS;
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;

  activeTab = 0;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadEmployee(id);
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.employeeService.getById(id).subscribe({
      next: (emp) => {
        this.employee.set(emp);
        this.breadcrumbService.updateLast(`${emp.firstName} ${emp.lastName}`.trim());
        this.loading.set(false);
      },
      error: () => {
        this.apiUnavailable.set(true);
        this.notification.warning('Server unavailable — showing sample employee data.');
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: number): string {
    const map: Record<number, string> = {
      0: 'draft',
      1: 'active',
      2: 'inactive',
      3: 'onleave',
    };
    return map[status] ?? 'draft';
  }
}
