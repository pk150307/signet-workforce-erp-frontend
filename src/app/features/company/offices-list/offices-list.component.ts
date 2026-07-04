import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig, featureDialogConfig } from '../../../core/utils/dialog.util';
import { CompanyService } from '../../../core/services/company.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BranchListItem, OfficeListItem } from '../../../core/models/company.models';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import {
  OfficeFormDialogComponent,
  OfficeFormResult,
} from '../office-form-dialog/office-form-dialog.component';

@Component({
  selector: 'app-offices-list',
  templateUrl: './offices-list.component.html',
  styleUrl: './offices-list.component.less',
})
export class OfficesListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<OfficeListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly branches = signal<BranchListItem[]>([]);
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<string>('');
  readonly cols = ['officeCode', 'officeName', 'branchName', 'floor', 'capacity', 'status', 'actions'];

  readonly statusOptions = computed(() => [
    { key: '', value: 'All' },
    { key: 'true', value: 'Active' },
    { key: 'false', value: 'Inactive' },
  ]);


  ngOnInit() {
    this.loadBranches();
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.companyService.getOffices({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      isActive: this.parseBoolFilter(this.statusCtrl.value),
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(emptyCursorPage(this.pager.pageSize));
        this.pager.reset();
        this.loading.set(false);
        this.notification.error('Failed to load offices.');
      },
    });
  }

  openCreate(): void {
    this.openForm();
  }

  openEdit(office: OfficeListItem): void {
    this.openForm(office);
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }

  deleteOffice(office: OfficeListItem) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Office',
        message: `Delete office "${office.officeName}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.companyService.deleteOffice(office.id).subscribe({
        next: () => {
          this.notification.success('Office deleted.');
          this.load();
        },
        error: () => this.notification.error('Failed to delete office.'),
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue('');
  }

  private loadBranches(): void {
    this.companyService.getBranches({ pageSize: 100, isActive: true }).subscribe({
      next: (result) => this.branches.set(result.items),
      error: () => this.branches.set([]),
    });
  }

  private openForm(office?: OfficeListItem): void {
    const branches = this.branches();
    if (!branches.length) {
      this.notification.warning('Add a branch before creating an office.');
      return;
    }

    this.dialog.open(OfficeFormDialogComponent, {
      ...featureDialogConfig({ width: '480px' }),
      data: { office: office ?? null, branches },
    }).afterClosed().subscribe((result?: OfficeFormResult) => {
      if (!result) return;

      const payload = {
        officeCode: result.officeCode,
        officeName: result.officeName,
        branchId: result.branchId,
        floor: result.floor,
        capacity: result.capacity,
        isActive: result.isActive,
      };

      const request$ = office
        ? this.companyService.updateOffice(office.id, payload)
        : this.companyService.createOffice(payload);

      request$.subscribe({
        next: () => {
          this.notification.success(office ? 'Office updated.' : 'Office created.');
          this.load();
        },
        error: (err) => {
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? (office ? 'Failed to update office.' : 'Failed to create office.'),
          );
        },
      });
    });
  }

  private parseBoolFilter(value: string | null): boolean | undefined {
    if (!value) return undefined;
    return value === 'true';
  }
}
