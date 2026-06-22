import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PfEsicService } from '../../../../core/services/pf-esic.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaginatedResult } from '../../../../core/models/api.models';
import { ClientListItem } from '../../../../core/models/client.models';
import { PfEsicEmployee, PfEsicQueryParams, PfEsicStatus } from '../../../../core/models/pf-esic.models';
import { EmployeeStatus, EMPLOYEE_STATUS_LABELS } from '../../../../core/models/employee.models';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PfEsicDrawerComponent } from '../pf-esic-drawer/pf-esic-drawer.component';
import { PfEsicBulkWizardComponent, PfEsicBulkWizardData } from '../pf-esic-bulk-wizard/pf-esic-bulk-wizard.component';
import { featureDialogConfig } from '../../../../core/utils/dialog.util';

type TriStateFilter = 'all' | 'yes' | 'no';

@Component({
  selector: 'app-pf-esic-list',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    PfEsicDrawerComponent,
  ],
  templateUrl: './pf-esic-list.component.html',
  styleUrl: './pf-esic-list.component.less',
})
export class PfEsicListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly pfEsicService = inject(PfEsicService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly usingMockData = signal(false);
  readonly data = signal<PaginatedResult<PfEsicEmployee> | null>(null);
  readonly drawerOpen = signal(false);
  readonly selectedEmployeeId = signal<string | null>(null);

  readonly searchCtrl = new FormControl('');
  readonly employeeStatusCtrl = new FormControl<EmployeeStatus | 'all'>(EmployeeStatus.Active);
  readonly statusCtrl = new FormControl<PfEsicStatus | null>(null);
  readonly clientCtrl = new FormControl<string | null>(null);
  readonly hasUanCtrl = new FormControl<TriStateFilter>('all');
  readonly hasPfCtrl = new FormControl<TriStateFilter>('all');
  readonly hasEsicCtrl = new FormControl<TriStateFilter>('all');

  readonly displayedColumns = [
    'employeeCode',
    'fullName',
    'clientCompanyName',
    'aadhaarNumber',
    'uanNumber',
    'pfNumber',
    'esicNumber',
    'status',
    'effectiveDate',
  ];

  readonly statusOptions: PfEsicStatus[] = ['Active', 'Inactive', 'Pending', 'Suspended'];
  readonly employeeStatusOptions = Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => ({
    value: +k as EmployeeStatus,
    label: v,
  }));
  readonly triStateOptions: { value: TriStateFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  readonly clients = signal<ClientListItem[]>([]);

  page = 1;
  pageSize = 20;
  sortBy = 'fullName';
  sortDir: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {

    this.loadClients();
    this.loadData();

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadData();
    });

    this.employeeStatusCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.loadData();
    });

    [this.statusCtrl, this.clientCtrl, this.hasUanCtrl, this.hasPfCtrl, this.hasEsicCtrl].forEach(ctrl => {
      ctrl.valueChanges.subscribe(() => {
        this.page = 1;
        this.loadData();
      });
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(false);

    const params = this.buildQueryParams();
    this.pfEsicService.getAll(params).subscribe({
      next: result => {
        this.data.set(result);
        this.usingMockData.set(false);
        this.loading.set(false);
      },
      error: () => {
        const mock = this.getMockData(params);
        this.data.set(mock);
        this.usingMockData.set(true);
        this.error.set(true);
        this.loading.set(false);
        this.notification.warning('Using sample data — API unavailable.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(sort: { active: string; direction: 'asc' | 'desc' | '' }): void {
    if (sort.direction) {
      this.sortBy = sort.active;
      this.sortDir = sort.direction;
    }
    this.loadData();
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

  exportCsv(): void {
    this.pfEsicService.export(this.buildQueryParams()).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pf-esic-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.notification.success('Export downloaded successfully.');
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
    this.hasPfCtrl.setValue('all');
    this.hasEsicCtrl.setValue('all');
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchCtrl.value ||
      this.employeeStatusCtrl.value !== EmployeeStatus.Active ||
      this.statusCtrl.value ||
      this.clientCtrl.value ||
      this.hasUanCtrl.value !== 'all' ||
      this.hasPfCtrl.value !== 'all' ||
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

  private buildQueryParams(): PfEsicQueryParams {
    return {
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      employeeStatus: this.employeeStatusCtrl.value === 'all'
        ? 'all'
        : (this.employeeStatusCtrl.value ?? EmployeeStatus.Active),
      status: this.statusCtrl.value ?? undefined,
      clientId: this.clientCtrl.value ?? undefined,
      hasUan: this.triToBool(this.hasUanCtrl.value),
      hasPf: this.triToBool(this.hasPfCtrl.value),
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

  private getMockData(params: PfEsicQueryParams): PaginatedResult<PfEsicEmployee> {
    let items = this.getAllMockEmployees();

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        e =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.uanNumber?.includes(q) ||
          e.pfNumber?.toLowerCase().includes(q) ||
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
    if (params.hasPf === true) items = items.filter(e => !!e.pfNumber);
    if (params.hasPf === false) items = items.filter(e => !e.pfNumber);
    if (params.hasEsic === true) items = items.filter(e => !!e.esicNumber);
    if (params.hasEsic === false) items = items.filter(e => !e.esicNumber);

    const sortBy = params.sortBy ?? 'fullName';
    const dir = params.sortDir === 'desc' ? -1 : 1;
    items = [...items].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortBy] ?? '');
      const bv = String((b as unknown as Record<string, unknown>)[sortBy] ?? '');
      return av.localeCompare(bv) * dir;
    });

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      items: paged,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  private getAllMockEmployees(): PfEsicEmployee[] {
    return [
      {
        id: '1',
        employeeId: 'emp-001',
        employeeCode: 'EMP001',
        fullName: 'Rajesh Kumar',
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
      },
    ];
  }
}
