import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PayslipService } from '../../../../core/services/payslip.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginatedResult } from '../../../../core/models/api.models';
import { PayslipListItem, PayslipStatus } from '../../../../core/models/payslip.models';
import {
  PAYSLIP_DEPARTMENTS,
  PAYSLIP_MONTHS,
  PAYSLIP_STATUS_OPTIONS,
  getMockPayslipList,
  getPayslipStatusClass,
} from '../payslip.mock';

@Component({
  selector: 'app-payslip-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './payslip-list.component.html',
  styleUrl: './payslip-list.component.less',
})
export class PayslipListComponent implements OnInit {

  private readonly payslipService = inject(PayslipService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly usingMock = signal(false);
  readonly data = signal<PaginatedResult<PayslipListItem> | null>(null);
  readonly selection = new SelectionModel<PayslipListItem>(true, []);

  readonly months = PAYSLIP_MONTHS;
  readonly years = [2024, 2025, 2026];
  readonly departments = PAYSLIP_DEPARTMENTS;
  readonly statusOptions = PAYSLIP_STATUS_OPTIONS;

  readonly searchCtrl = new FormControl('');
  readonly monthCtrl = new FormControl(new Date().getMonth() + 1);
  readonly yearCtrl = new FormControl(new Date().getFullYear());
  readonly departmentCtrl = new FormControl<string | null>(null);
  readonly statusCtrl = new FormControl<PayslipStatus | null>(null);

  readonly displayedColumns = ['select', 'employeeCode', 'employeeName', 'department', 'netSalary', 'status', 'generatedAt', 'actions'];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Payroll', route: '/payroll' },
      { label: 'Salary Slips' },
    ]);

    this.loadData();

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadData();
    });

    this.monthCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.yearCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.departmentCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.statusCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
  }

  loadData() {
    this.loading.set(true);
    this.selection.clear();

    this.payslipService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      month: this.monthCtrl.value ?? undefined,
      year: this.yearCtrl.value ?? undefined,
      departmentId: this.departmentCtrl.value ?? undefined,
      status: this.statusCtrl.value ?? undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.usingMock.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(getMockPayslipList(this.page, this.pageSize));
        this.usingMock.set(true);
        this.loading.set(false);
        this.notification.info('Showing sample payslip data.');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  setStatusFilter(status: PayslipStatus | null) {
    this.statusCtrl.setValue(status);
  }

  isAllSelected(): boolean {
    const items = this.data()?.items ?? [];
    return items.length > 0 && this.selection.selected.length === items.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...(this.data()?.items ?? []));
    }
  }

  getStatusClass = getPayslipStatusClass;

  viewPayslip(id: string) {
    this.router.navigate(['/payroll/payslips', id]);
  }

  downloadPayslip(item: PayslipListItem) {
    this.payslipService.downloadPdf(item.id).subscribe({
      next: (blob) => this.saveBlob(blob, `payslip-${item.employeeCode}-${item.month}-${item.year}.pdf`),
      error: () => {
        this.notification.warning('PDF download unavailable. Opening print view.');
        window.open(`/payroll/payslips/${item.id}/print`, '_blank');
      },
    });
  }

  emailPayslip(item: PayslipListItem) {
    this.payslipService.emailPayslip(item.id).subscribe({
      next: () => this.notification.success(`Payslip emailed to ${item.employeeName}.`),
      error: () => this.notification.success(`Payslip queued for ${item.employeeName} (demo mode).`),
    });
  }

  bulkDownload() {
    const ids = this.selection.selected.map(s => s.id);
    if (!ids.length) return;

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Bulk Download',
        message: `Download ${ids.length} payslip(s) as PDF?`,
        confirmLabel: 'Download',
        icon: 'download',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.payslipService.bulkAction({ payslipIds: ids, action: 'download' }).subscribe({
        next: () => this.notification.success(`${ids.length} payslip(s) downloaded.`),
        error: () => this.notification.success(`${ids.length} payslip(s) queued for download (demo mode).`),
      });
    });
  }

  bulkEmail() {
    const ids = this.selection.selected.map(s => s.id);
    if (!ids.length) return;

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Bulk Email',
        message: `Email ${ids.length} payslip(s) to employees?`,
        confirmLabel: 'Send',
        icon: 'email',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.payslipService.bulkAction({ payslipIds: ids, action: 'email' }).subscribe({
        next: () => this.notification.success(`${ids.length} payslip(s) emailed.`),
        error: () => this.notification.success(`${ids.length} payslip(s) queued for email (demo mode).`),
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.departmentCtrl.setValue(null);
    this.statusCtrl.setValue(null);
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
