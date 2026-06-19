import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AttendanceService } from '../../../core/services/attendance.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaginatedResult } from '../../../core/models/api.models';
import { AttendanceCorrectionRequest } from '../../../core/models/attendance.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({ selector: 'app-attendance-correction', standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, EmptyStateComponent, SkeletonLoaderComponent],
  templateUrl: './attendance-correction.component.html', styleUrl: './attendance-correction.component.less' })
export class AttendanceCorrectionComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<AttendanceCorrectionRequest> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly cols = ['employeeName','date','currentStatus','requestedStatus','reason','status'];
  page = 1; pageSize = 20;
  ngOnInit() {
    this.breadcrumbService.setItems([{ label: 'Attendance', route: '/attendance' }, { label: 'Corrections' }]);
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => { this.page = 1; this.load(); });
  }
  load() { this.loading.set(true); this.attendanceService.getCorrections({ page: this.page, pageSize: this.pageSize, search: this.searchCtrl.value || undefined }).subscribe({ next: r => { this.data.set(r); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  onPageChange(e: PageEvent) { this.page = e.pageIndex + 1; this.pageSize = e.pageSize; this.load(); }
  approve(row: AttendanceCorrectionRequest) { this.notification.success('Correction approved for ' + row.employeeName); }
  reject(row: AttendanceCorrectionRequest) { this.notification.info('Correction rejected for ' + row.employeeName); }
}