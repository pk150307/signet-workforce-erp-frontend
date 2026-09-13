import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DesignationService } from '../../../core/services/designation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { DesignationDetail } from '../../../core/models/designation.models';

@Component({
  selector: 'app-designation-detail',
  templateUrl: './designation-detail.component.html',
  styleUrl: './designation-detail.component.less',
})
export class DesignationDetailComponent implements OnInit {
  private readonly designationService = inject(DesignationService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly designation = signal<DesignationDetail | null>(null);

  private designationId = '';

  ngOnInit() {
    this.designationId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load(this.designationId);
  }

  load(id: string) {
    this.loading.set(true);
    this.designationService.getById(id).subscribe({
      next: (designation) => {
        this.designation.set(designation);
        this.breadcrumbService.updateLast(designation.designationName);
        this.loading.set(false);
      },
      error: () => {
        this.designation.set(null);
        this.notification.error('Failed to load designation details.');
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
