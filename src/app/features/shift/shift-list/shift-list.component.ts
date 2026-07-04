import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';

import { ShiftService } from '../../../core/services/shift.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ShiftListItem } from '../../../core/models/shift.models';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';

@Component({
  selector: 'app-shift-list',
    templateUrl: './shift-list.component.html',
  styleUrl: './shift-list.component.less',
})
export class ShiftListComponent implements OnInit {

  private readonly shiftService = inject(ShiftService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<ShiftListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<string>('');
  readonly cols = ['shiftCode', 'shiftName', 'timing', 'breakMinutes', 'weeklyOff', 'assignedCount', 'status', 'actions'];

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
    this.shiftService.getAll({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      isActive: this.parseBoolFilter(this.statusCtrl.value),
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    if (event.direction === 'next') {
      const p = this.pager.nextPageParams();
      if (p) this.load(p);
    } else {
      const p = this.pager.prevPageParams();
      if (p) this.load(p);
    }
  }

  editShift(id: string) {
    this.router.navigate(['/shifts', id, 'edit']);
  }

  deleteShift(shift: ShiftListItem) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Shift',
        message: `Delete shift "${shift.shiftName}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.shiftService.delete(shift.id).subscribe({
        next: () => {
          this.notification.success('Shift deleted.');
          this.load();
        },
        error: () => this.notification.error('Failed to delete shift.'),
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue('');
  }

  private parseBoolFilter(value: string | null): boolean | undefined {
    if (!value) return undefined;
    return value === 'true';
  }

  formatTiming(shift: ShiftListItem): string {
    return `${shift.startTime} – ${shift.endTime}`;
  }
}
