import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AttendanceService } from '../../../core/services/attendance.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import { AttendanceCorrectionRequest } from '../../../core/models/attendance.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';

@Component({
  selector: 'app-attendance-correction',
  templateUrl: './attendance-correction.component.html',
  styleUrl: './attendance-correction.component.less',
})
export class AttendanceCorrectionComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<AttendanceCorrectionRequest> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly cols = ['employeeName', 'date', 'currentStatus', 'requestedStatus', 'reason', 'status'];

  ngOnInit() {
    this.breadcrumbService.setItems([{ label: 'Attendance', route: '/attendance' }, { label: 'Corrections' }]);
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.attendanceService.getCorrections({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.pager.reset();
          this.load(this.pager.firstPageParams());
          return;
        }
        this.data.set(emptyCursorPage(this.pager.pageSize));
        this.pager.reset();
        this.loading.set(false);
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }

  approve(row: AttendanceCorrectionRequest) {
    this.notification.success('Correction approved for ' + row.employeeName);
  }

  reject(row: AttendanceCorrectionRequest) {
    this.notification.info('Correction rejected for ' + row.employeeName);
  }
}
