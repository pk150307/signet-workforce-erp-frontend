import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PfEsicService } from '../../../../core/services/pf-esic.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CursorPageParams, CursorPaginatedResult } from '../../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../../library/components/pagination/pagination.component';
import { ClientListItem } from '../../../../core/models/client.models';
import { PfEsicEmployee, PfEsicQueryParams, PfEsicStatus } from '../../../../core/models/pf-esic.models';
import { EmployeeStatus, EMPLOYEE_STATUS_LABELS } from '../../../../core/models/employee.models';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PfEsicDrawerComponent } from '../pf-esic-drawer/pf-esic-drawer.component';
import { PfEsicBulkWizardComponent, PfEsicBulkWizardData } from '../pf-esic-bulk-wizard/pf-esic-bulk-wizard.component';
import { featureDialogConfig } from '../../../../core/utils/dialog.util';
import { paginateMock } from '../../../../core/utils/mock-pagination.util';

type TriStateFilter = 'all' | 'yes' | 'no';

@Component({
  selector: 'app-pf-esic-list',
    templateUrl: './pf-esic-list.component.html',
  styleUrl: './pf-esic-list.component.less',
})
export class PfEsicListComponent implements OnInit {

  private readonly pfEsicService = inject(PfEsicService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly usingMockData = signal(false);
  readonly data = signal<CursorPaginatedResult<PfEsicEmployee> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly drawerOpen = signal(false);
  readonly selectedEmployeeId = signal<string | null>(null);

  readonly searchCtrl = new FormControl('');
  readonly employeeStatusCtrl = new FormControl<EmployeeStatus | 'all'>(EmployeeStatus.Active);
  readonly statusCtrl = new FormControl<PfEsicStatus | null>(null);
  readonly clientCtrl = new FormControl<string | null>(null);
  readonly hasUanCtrl = new FormControl<TriStateFilter>('all');
  readonly hasEsicCtrl = new FormControl<TriStateFilter>('all');

  readonly displayedColumns = [
    'employeeCode',
    'softCode',
    'fullName',
    'clientCompanyName',
    'aadhaarNumber',
    'uanNumber',
    'esicNumber',
    'status',
    'effectiveDate'
  ];

  readonly statusOptions: PfEsicStatus[] = ['Active', 'Inactive', 'Pending', 'Suspended'];

  readonly clientOptions = computed(() => [
    { key: '', value: 'All Clients' },
    ...this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  ]);

  readonly employeeStatusOptions = computed(() => [
    { key: 'all', value: 'All Statuses' },
    ...Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => ({
      key: String(k),
      value: v,
    })),
  ]);

  readonly pfEsicStatusOptions = computed(() => [
    { key: '', value: 'All PF/ESIC Statuses' },
    ...this.statusOptions.map(s => ({ key: s, value: s })),
  ]);

  readonly triStateOptions = computed(() =>
    this.triStateFilterOptions.map(opt => ({ key: opt.value, value: opt.label })),
  );

  private readonly triStateFilterOptions: { value: TriStateFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  readonly clients = signal<ClientListItem[]>([]);

  sortBy = 'fullName';
  sortDir: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {

    this.loadClients();
    this.loadData();

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.pager.reset();
      this.loadData(this.pager.firstPageParams());
    });

    this.employeeStatusCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.pager.reset();
      this.loadData(this.pager.firstPageParams());
    });

    [this.statusCtrl, this.clientCtrl, this.hasUanCtrl, this.hasEsicCtrl].forEach(ctrl => {
      ctrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.pager.reset();
        this.loadData(this.pager.firstPageParams());
      });
    });
  }

  loadData(pageParams?: CursorPageParams): void {
    this.loading.set(true);
    this.error.set(false);

    const params = this.buildQueryParams(pageParams ?? this.pager.firstPageParams());
    this.pfEsicService.getAll(params).subscribe({
      next: result => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.usingMockData.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.pager.reset();
          this.loadData(this.pager.firstPageParams());
          return;
        }
        const mock = this.getMockData(params);
        this.data.set(mock);
        this.pager.apply(mock.pagination);
        this.usingMockData.set(true);
        this.error.set(true);
        this.loading.set(false);
        this.notification.warning('Using sample data — API unavailable.');
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.loadData(p);
  }

  toggleSort(active: string): void {
    if (this.sortBy === active) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = active;
      this.sortDir = 'asc';
    }
    this.loadData();
  }

  sortIcon(active: string): string {
    if (this.sortBy !== active) return 'unfold_more';
    return this.sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward';
  }

  openDrawer(employee: PfEsicEmployee): void {
    this.selectedEmployeeId.set(employee.employeeId);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedEmployeeId.set(null);
  }

  onDrawerSaved(): void {
    this.loadData();
  }

  exportExcel(): void {
    this.downloadExport('excel');
  }

  exportPdf(): void {
    this.downloadExport('pdf');
  }

  private downloadExport(format: 'excel' | 'pdf'): void {
    this.pfEsicService.export({ ...this.buildQueryParams(), format }).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'pdf' ? 'pdf' : 'xlsx';
        a.download = `pf-esic-export-${new Date().toISOString().slice(0, 10)}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        this.notification.success(`${format === 'pdf' ? 'PDF' : 'Excel'} export downloaded successfully.`);
      },
      error: () => this.notification.error('Export failed.'),
    });
  }

  openBulkUpdate(): void {
    this.openWizard('update');
  }

  openBulkImport(): void {
    this.openWizard('import');
  }

  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.employeeStatusCtrl.setValue(EmployeeStatus.Active);
    this.statusCtrl.setValue(null);
    this.clientCtrl.setValue(null);
    this.hasUanCtrl.setValue('all');
    this.hasEsicCtrl.setValue('all');
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchCtrl.value ||
      this.employeeStatusCtrl.value !== EmployeeStatus.Active ||
      this.statusCtrl.value ||
      this.clientCtrl.value ||
      this.hasUanCtrl.value !== 'all' ||
      this.hasEsicCtrl.value !== 'all'
    );
  }

  getStatusClass(status: PfEsicStatus): string {
    const map: Record<PfEsicStatus, string> = {
      Active: 'active',
      Inactive: 'inactive',
      Pending: 'pending',
      Suspended: 'onhold',
    };
    return map[status] ?? 'pending';
  }

  private openWizard(mode: PfEsicBulkWizardData['mode']): void {
    const ref = this.dialog.open(PfEsicBulkWizardComponent, featureDialogConfig({
      width: '720px',
      data: { mode } satisfies PfEsicBulkWizardData,
    }));

    ref.afterClosed().subscribe(reloaded => {
      if (reloaded) this.loadData();
    });
  }

  private buildQueryParams(pageParams: CursorPageParams = this.pager.firstPageParams()): PfEsicQueryParams {
    return {
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      employeeStatus: this.employeeStatusCtrl.value === 'all'
        ? 'all'
        : (this.employeeStatusCtrl.value ?? EmployeeStatus.Active),
      status: (this.statusCtrl.value as PfEsicStatus | '' | null) || undefined,
      clientId: this.clientCtrl.value || undefined,
      hasUan: this.triToBool(this.hasUanCtrl.value),
      hasEsic: this.triToBool(this.hasEsicCtrl.value),
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    };
  }

  private loadClients(): void {
    this.clientsService.getAllForSelect().subscribe({
      next: clients => this.clients.set(clients.filter(c => c.id && c.companyName)),
      error: () => this.clients.set([]),
    });
  }

  private triToBool(value: TriStateFilter | null): boolean | undefined {
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return undefined;
  }

  private getMockData(params: PfEsicQueryParams): CursorPaginatedResult<PfEsicEmployee> {
    let items = this.getAllMockEmployees();

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        e =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          (e.softCode ?? '').toLowerCase().includes(q) ||
          (e.fatherName ?? '').toLowerCase().includes(q) ||
          e.uanNumber?.includes(q) ||
          e.esicNumber?.includes(q)
      );
    }

    if (params.status) {
      items = items.filter(e => e.status === params.status);
    }

    if (params.clientId) {
      const clientName = this.clients().find(c => c.id === params.clientId)?.companyName;
      if (clientName) {
        items = items.filter(e => e.clientCompanyName === clientName);
      }
    }

    if (params.department) {
      items = items.filter(e => e.department === params.department);
    }

    if (params.hasUan === true) items = items.filter(e => !!e.uanNumber);
    if (params.hasUan === false) items = items.filter(e => !e.uanNumber);
    if (params.hasEsic === true) items = items.filter(e => !!e.esicNumber);
    if (params.hasEsic === false) items = items.filter(e => !e.esicNumber);

    const sortBy = params.sortBy ?? 'fullName';
    const dir = params.sortDir === 'desc' ? -1 : 1;
    items = [...items].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortBy] ?? '');
      const bv = String((b as unknown as Record<string, unknown>)[sortBy] ?? '');
      return av.localeCompare(bv) * dir;
    });

    return paginateMock(items, {
      pageSize: params.pageSize ?? this.pager.pageSize,
      cursor: params.cursor,
      direction: params.direction,
    }, ['fullName', 'employeeCode']);
  }

  private getAllMockEmployees(): PfEsicEmployee[] {
    return [
      {
        id: '1',
        employeeId: 'emp-001',
        employeeCode: 'EMP001',
        softCode: 'TR-01',
        fullName: 'Rajesh Kumar',
        fatherName: 'Suresh Kumar',
        department: 'Operations',
        designation: 'Supervisor',
        clientCompanyName: 'Tata Realty',
        siteName: 'Mumbai HQ',
        aadhaarNumber: '123456789012',
        uanNumber: '100012345678',
        pfNumber: 'MH/BAN/1234567/000/1234567',
        esicNumber: '12345678901234567',
        pfContributionEmployee: 12,
        pfContributionEmployer: 12,
        effectiveDate: '2024-04-01',
        status: 'Active',
      },
      {
        id: '2',
        employeeId: 'emp-002',
        employeeCode: 'EMP002',
        fullName: 'Priya Sharma',
        department: 'Finance',
        designation: 'Accountant',
        clientCompanyName: 'Reliance Industries',
        siteName: 'Delhi Branch',
        aadhaarNumber: '987654321098',
        uanNumber: '100098765432',
        pfNumber: 'DL/DEL/7654321/000/7654321',
        esicNumber: '98765432109876543',
        effectiveDate: '2023-01-15',
        status: 'Active',
      },
      {
        id: '3',
        employeeId: 'emp-003',
        employeeCode: 'EMP003',
        fullName: 'Amit Patel',
        department: 'Operations',
        designation: 'Technician',
        clientCompanyName: 'Infosys Ltd',
        siteName: 'Pune Site',
        aadhaarNumber: '111122223333',
        uanNumber: '100011112222',
        status: 'Pending',
      },
      {
        id: '4',
        employeeId: 'emp-004',
        employeeCode: 'EMP004',
        fullName: 'Sneha Reddy',
        department: 'HR',
        designation: 'HR Executive',
        clientCompanyName: 'Tata Realty',
        siteName: 'Hyderabad',
        aadhaarNumber: '444455556666',
        pfNumber: 'TS/HYD/1111111/000/1111111',
        esicNumber: '11111111111111111',
        effectiveDate: '2022-06-01',
        status: 'Active',
      },
      {
        id: '5',
        employeeId: 'emp-005',
        employeeCode: 'EMP005',
        fullName: 'Vikram Singh',
        department: 'Security',
        designation: 'Guard',
        clientCompanyName: 'Reliance Industries',
        siteName: 'Chennai',
        status: 'Inactive',
      },
      {
        id: '6',
        employeeId: 'emp-006',
        employeeCode: 'EMP006',
        fullName: 'Anita Desai',
        department: 'Finance',
        designation: 'Analyst',
        clientCompanyName: 'Infosys Ltd',
        aadhaarNumber: '777788889999',
        uanNumber: '100033344455',
        pfNumber: 'GJ/AHD/3333333/000/3333333',
        esicNumber: '33333333333333333',
        status: 'Suspended',
      }
  ];
  }
}
