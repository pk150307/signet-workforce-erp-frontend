import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { DepartmentDetail } from '../../../core/models/department.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './department-detail.component.html',
  styleUrl: './department-detail.component.less',
})
export class DepartmentDetailComponent implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly department = signal<DepartmentDetail | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.departmentService.getById(id).subscribe({
      next: (dept) => {
        this.department.set(dept);
        this.breadcrumbService.updateLast(dept.departmentName);
        this.loading.set(false);
      },
      error: () => {
        this.department.set(null);
        this.notification.error('Failed to load department details.');
        this.loading.set(false);
      },
    });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'D';
  }

  display(value: string | number | null | undefined): string {
    if (value == null || value === '') return '—';
    return String(value);
  }
}
