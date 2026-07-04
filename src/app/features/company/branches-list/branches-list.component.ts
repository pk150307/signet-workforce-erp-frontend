import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig, featureDialogConfig } from '../../../core/utils/dialog.util';
import { CompanyService } from '../../../core/services/company.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BranchListItem } from '../../../core/models/company.models';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import {
  BranchFormDialogComponent,
  BranchFormResult,
} from '../branch-form-dialog/branch-form-dialog.component';

@Component({
  selector: 'app-branches-list',
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.less',
})
export class BranchesListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<BranchListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<string>('');
  readonly cols = ['branchCode', 'branchName', 'location', 'headCount', 'status', 'actions'];

  readonly statusOptions = computed(() => [
    { key: '', value: 'All' },
    { key: 'true', value: 'Active' },
    { key: 'false', value: 'Inactive' },
  ]);


  ngOnInit() {
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
    this.companyService.getBranches({
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
        this.notification.error('Failed to load branches.');
      },
    });
  }

  openCreate(): void {
    this.openForm();
  }

  openEdit(branch: BranchListItem): void {
    this.openForm(branch);
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }

  deleteBranch(branch: BranchListItem) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Branch',
        message: `Delete branch "${branch.branchName}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.companyService.deleteBranch(branch.id).subscribe({
        next: () => {
          this.notification.success('Branch deleted.');
          this.load();
        },
        error: () => this.notification.error('Failed to delete branch.'),
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue('');
  }

  private openForm(branch?: BranchListItem): void {
    this.dialog.open(BranchFormDialogComponent, {
      ...featureDialogConfig({ width: '480px' }),
      data: { branch: branch ?? null },
    }).afterClosed().subscribe((result?: BranchFormResult) => {
      if (!result) return;

      const request$ = branch
        ? this.companyService.updateBranch(branch.id, result)
        : this.companyService.createBranch(result);

      request$.subscribe({
        next: () => {
          this.notification.success(branch ? 'Branch updated.' : 'Branch created.');
          this.load();
        },
        error: (err) => {
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? (branch ? 'Failed to update branch.' : 'Failed to create branch.'),
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
