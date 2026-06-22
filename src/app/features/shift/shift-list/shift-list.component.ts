import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';

import { ShiftService } from '../../../core/services/shift.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ShiftListItem } from '../../../core/models/shift.models';
import { PaginatedResult } from '../../../core/models/api.models';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-shift-list',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgFor,
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
  ],
  templateUrl: './shift-list.component.html',
  styleUrl: './shift-list.component.less',
})
export class ShiftListComponent implements OnInit {

  private readonly shiftService = inject(ShiftService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<ShiftListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<boolean | null>(null);
  readonly cols = ['shiftCode', 'shiftName', 'timing', 'breakMinutes', 'weeklyOff', 'assignedCount', 'status', 'actions'];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.shiftService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      isActive: this.statusCtrl.value ?? undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
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
    this.statusCtrl.setValue(null);
  }

  formatTiming(shift: ShiftListItem): string {
    return `${shift.startTime} – ${shift.endTime}`;
  }
}
