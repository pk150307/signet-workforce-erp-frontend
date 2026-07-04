import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceFilterService } from '../../../core/services/attendance-filter.service';
import { ClientsService } from '../../../core/services/clients.service';
import {
  AttendanceEmployeeListItem,
  AttendanceRegisterMeta,
  MONTH_NAMES,
  rowStatusLabel,
} from '../../../core/models/attendance.models';
import { ClientListItem } from '../../../core/models/client.models';
import { CursorPageParams } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  isInvalidCursorError,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';

@Component({
  selector: 'app-attendance-employee-list',
  templateUrl: './attendance-employee-list.component.html',
  styleUrl: './attendance-employee-list.component.less',
})
export class AttendanceEmployeeListComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly attendanceFilter = inject(AttendanceFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);

  readonly clientsLoading = signal(true);
  readonly loading = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  readonly items = signal<AttendanceEmployeeListItem[]>([]);
  readonly register = signal<AttendanceRegisterMeta | null>(null);
  readonly pager = new CursorPaginationState();
  readonly monthNames = MONTH_NAMES;
  readonly rowStatusLabel = rowStatusLabel;
  readonly cols = ['employee', 'department', 'site', 'present', 'absent', 'leave', 'overtime', 'night', 'punctuality', 'unmarked', 'status', 'actions'];

  readonly filters = new FormGroup({
    clientId: new FormControl(this.attendanceFilter.clientIdOrEmpty(), { nonNullable: true, validators: Validators.required }),
    month: new FormControl(this.attendanceFilter.month(), { nonNullable: true }),
    year: new FormControl(this.attendanceFilter.year(), { nonNullable: true }),
  });

  readonly years = [2024, 2025, 2026, 2027];

  readonly clientOptions = computed(() =>
    this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  );

  readonly monthOptions = computed(() =>
    this.monthNames.map((name, i) => ({ key: String(i + 1), value: name })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

  ngOnInit() {
    this.attendanceFilter.bindControls(
      {
        month: this.filters.controls.month,
        year: this.filters.controls.year,
        clientId: this.filters.controls.clientId,
      },
      this.destroyRef,
      () => this.reloadFirstPage(),
    );

    this.clientsLoading.set(true);
    this.clientsService.getAllForSelect().subscribe({
      next: c => {
        this.clients.set(c);
        this.clientsLoading.set(false);
        if (!this.filters.value.clientId && c.length === 1) {
          this.filters.controls.clientId.setValue(c[0].id);
        }
      },
      error: () => this.clientsLoading.set(false),
    });

    this.load();
  }

  load(params?: CursorPageParams) {
    const v = this.filters.getRawValue();
    if (!v.clientId) return;
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.attendanceService.getEmployeeList({ ...v, ...pageParams }).subscribe({
      next: res => {
        this.register.set(res.register);
        this.items.set(res.items);
        this.pager.apply(res.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.pager.reset();
          this.load(this.pager.firstPageParams());
          return;
        }
        this.items.set([]);
        this.register.set(null);
        this.pager.reset();
        this.loading.set(false);
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    if (event.direction === 'next') {
      const p = this.pager.nextPageParams();
      if (p) this.load(p);
      return;
    }
    const p = this.pager.prevPageParams();
    if (p) this.load(p);
  }

  private reloadFirstPage() {
    this.pager.reset();
    this.load(this.pager.firstPageParams());
  }

  openRegister() {
    const v = this.filters.getRawValue();
    this.router.navigate(['/attendance/register'], {
      queryParams: { clientId: v.clientId, month: v.month, year: v.year },
    });
  }

  viewEmployee(employee: AttendanceEmployeeListItem) {
    const v = this.filters.getRawValue();
    this.router.navigate(['/attendance/employees', employee.employeeId], {
      queryParams: { month: v.month, year: v.year, clientId: v.clientId },
    });
  }
}
