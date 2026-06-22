import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';
import { ClientsService } from '../../../core/services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClientListItem } from '../../../core/models/client.models';
import {
  AttendanceGridResponse,
  AttendanceStatusCode,
  ATTENDANCE_STATUS_OPTIONS,
  MONTH_NAMES,
  RegisterPeriod,
  cellClass,
  cellShort,
} from '../../../core/models/attendance.models';

type DraftMap = Record<string, Record<string, number | null>>;

interface RegisterExtras {
  overtimeHours: number;
  nightAllowance: number;
  punctualityAward: number;
}

type RegisterExtrasMap = Record<string, RegisterExtras>;

const EMPTY_EXTRAS: RegisterExtras = {
  overtimeHours: 0,
  nightAllowance: 0,
  punctualityAward: 0,
};

function normalizeCellStatus(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function extrasEqual(a: RegisterExtras, b: RegisterExtras): boolean {
  return a.overtimeHours === b.overtimeHours
    && a.nightAllowance === b.nightAllowance
    && a.punctualityAward === b.punctualityAward;
}

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-attendance-register',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgClass, DatePipe, RouterLink, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  templateUrl: './attendance-register.component.html',
  styleUrl: './attendance-register.component.less',
})
export class AttendanceRegisterComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly clientsService = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  private skipFilterReload = false;

  readonly loading = signal(true);
  readonly clientsLoading = signal(true);
  readonly clients = signal<ClientListItem[]>([]);
  readonly saving = signal(false);
  readonly submittingEmployeeId = signal<string | null>(null);
  readonly grid = signal<AttendanceGridResponse | null>(null);
  readonly draft = signal<DraftMap>({});
  readonly saved = signal<DraftMap>({});
  readonly draftExtras = signal<RegisterExtrasMap>({});
  readonly savedExtras = signal<RegisterExtrasMap>({});
  readonly showLockDialog = signal(false);
  readonly showUnlockDialog = signal(false);
  readonly showImportPanel = signal(false);
  readonly importPreview = signal<{ valid: number; errors: number; cells: number } | null>(null);
  readonly importFile = signal<File | null>(null);
  readonly verified = new FormControl(false);
  readonly unlockReason = new FormControl('', Validators.required);

  readonly monthNames = MONTH_NAMES;
  readonly years = [2024, 2025, 2026, 2027];
  readonly statusOptions = ATTENDANCE_STATUS_OPTIONS;
  readonly cellClass = cellClass;
  readonly cellShort = cellShort;

  readonly filters = new FormGroup({
    clientId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    month: new FormControl(new Date().getMonth() + 1, { nonNullable: true }),
    year: new FormControl(new Date().getFullYear(), { nonNullable: true }),
  });

  period!: RegisterPeriod;

  readonly isLocked = computed(() => this.grid()?.register.status === 'locked');

  readonly pendingChanges = computed(() => {
    const g = this.grid();
    const draft = this.draft();
    const saved = this.saved();
    const draftExtras = this.draftExtras();
    const savedExtras = this.savedExtras();
    if (!g) return {} as Record<string, boolean>;

    const result: Record<string, boolean> = {};
    for (const emp of g.employees) {
      const draftRow = draft[emp.employeeId] ?? {};
      const savedRow = saved[emp.employeeId] ?? {};
      const cellsChanged = g.dates.some(
        date => normalizeCellStatus(draftRow[date]) !== normalizeCellStatus(savedRow[date]),
      );
      const extrasChanged = !extrasEqual(
        draftExtras[emp.employeeId] ?? EMPTY_EXTRAS,
        savedExtras[emp.employeeId] ?? EMPTY_EXTRAS,
      );
      result[emp.employeeId] = cellsChanged || extrasChanged;
    }
    return result;
  });

  readonly canLockRegister = computed(() => {
    if (this.isLocked()) return false;
    const g = this.grid();
    if (!g?.employees.length) return false;
    if (Object.values(this.pendingChanges()).some(Boolean)) return false;
    return Boolean(g.register.isComplete);
  });

  readonly lockBlockReason = computed(() => {
    if (this.isLocked()) return 'Register is already locked.';
    const g = this.grid();
    if (!g) return '';
    const pendingCount = Object.values(this.pendingChanges()).filter(Boolean).length;
    if (pendingCount > 0) {
      return `${pendingCount} employee row(s) have unsaved changes. Submit them before locking.`;
    }
    if (!g.register.isComplete) {
      return `${g.register.unmarkedCells} cell(s) still unmarked across ${g.register.totalEmployees} employee(s).`;
    }
    return '';
  });

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    this.skipFilterReload = true;
    this.filters.patchValue({
      clientId: q.get('clientId') ?? '',
      month: Number(q.get('month')) || new Date().getMonth() + 1,
      year: Number(q.get('year')) || new Date().getFullYear(),
    });
    this.skipFilterReload = false;

    if (!this.filters.value.clientId) {
      this.router.navigate(['/attendance']);
      return;
    }

    this.syncPeriodFromFilters();

    this.clientsService.getAllForSelect().subscribe({
      next: clients => {
        this.clients.set(clients);
        this.clientsLoading.set(false);
      },
      error: () => this.clientsLoading.set(false),
    });

    this.filters.valueChanges.subscribe(() => this.onFiltersChanged());
    this.load();
  }

  clientLabel(clientId: string): string {
    return this.clients().find(c => c.id === clientId)?.companyName ?? 'Client';
  }

  private syncPeriodFromFilters() {
    const v = this.filters.getRawValue();
    this.period = { clientId: v.clientId, month: v.month, year: v.year };
  }

  private onFiltersChanged() {
    if (this.skipFilterReload) return;

    const v = this.filters.getRawValue();
    if (!v.clientId) return;

    const periodUnchanged =
      v.clientId === this.period.clientId
      && v.month === this.period.month
      && v.year === this.period.year;
    if (periodUnchanged) return;

    const hasPending = Object.values(this.pendingChanges()).some(Boolean);
    if (hasPending) {
      this.dialog.open(
        ConfirmDialogComponent,
        confirmDialogConfig({
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. Switch client or period anyway?',
          confirmLabel: 'Switch Anyway',
          confirmColor: 'warn',
          icon: 'warning',
        }),
      ).afterClosed().subscribe(confirmed => {
        if (!confirmed) {
          this.skipFilterReload = true;
          this.filters.patchValue({
            clientId: this.period.clientId,
            month: this.period.month,
            year: this.period.year,
          }, { emitEvent: false });
          this.skipFilterReload = false;
          return;
        }
        this.applyPeriodFilterChange(v);
      });
      return;
    }

    this.applyPeriodFilterChange(v);
  }

  private applyPeriodFilterChange(v: { clientId: string; month: number; year: number }) {
    this.syncPeriodFromFilters();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { clientId: v.clientId, month: v.month, year: v.year },
      replaceUrl: true,
    });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.attendanceService.getGrid(this.period).subscribe({
      next: g => {
        this.grid.set(g);
        this.initDraftFromGrid(g);
        this.loading.set(false);
      },
      error: () => { this.notification.error('Failed to load register.'); this.loading.set(false); },
    });
  }

  private initDraftFromGrid(g: AttendanceGridResponse) {
    const draft: DraftMap = {};
    const extras: RegisterExtrasMap = {};
    for (const emp of g.employees) {
      const row: Record<string, number | null> = {};
      for (const date of g.dates) {
        row[date] = normalizeCellStatus(emp.cells[date]);
      }
      draft[emp.employeeId] = row;
      extras[emp.employeeId] = {
        overtimeHours: emp.overtimeHours ?? 0,
        nightAllowance: emp.nightAllowance ?? 0,
        punctualityAward: emp.punctualityAward ?? 0,
      };
    }
    this.draft.set(structuredClone(draft));
    this.saved.set(structuredClone(draft));
    this.draftExtras.set(structuredClone(extras));
    this.savedExtras.set(structuredClone(extras));
  }

  getExtras(employeeId: string): RegisterExtras {
    return this.draftExtras()[employeeId] ?? EMPTY_EXTRAS;
  }

  onExtraChange(employeeId: string, field: keyof RegisterExtras, rawValue: string | number) {
    if (this.isLocked()) return;
    const value = Math.max(0, Number(rawValue) || 0);
    this.draftExtras.update(current => ({
      ...current,
      [employeeId]: { ...(current[employeeId] ?? EMPTY_EXTRAS), [field]: value },
    }));
  }

  getCellValue(employeeId: string, date: string): number | null {
    return normalizeCellStatus(this.draft()[employeeId]?.[date]);
  }

  onCellChange(employeeId: string, date: string, rawValue: string) {
    if (this.isLocked()) return;
    const status = normalizeCellStatus(rawValue);
    this.draft.update(current => ({
      ...current,
      [employeeId]: { ...current[employeeId], [date]: status },
    }));
  }

  cellSelectValue(status: number | null | undefined): string {
    return status == null ? '' : String(status);
  }

  hasPendingChanges(employeeId: string): boolean {
    return this.pendingChanges()[employeeId] ?? false;
  }

  submitEmployee(employeeId: string) {
    if (this.isLocked() || !this.hasPendingChanges(employeeId)) return;
    const g = this.grid();
    if (!g) return;

    const cells = g.dates.map(date => ({
      date,
      status: this.draft()[employeeId]?.[date] ?? null,
    }));
    const extras = this.getExtras(employeeId);

    this.submittingEmployeeId.set(employeeId);
    this.attendanceService.submitEmployeeRow(employeeId, {
      ...this.period,
      cells,
      overtimeHours: extras.overtimeHours,
      nightAllowance: extras.nightAllowance,
      punctualityAward: extras.punctualityAward,
    }).subscribe({
      next: res => {
        this.grid.update(current => {
          if (!current) return current;
          return {
            ...current,
            register: res.register,
            employees: current.employees.map(emp =>
              emp.employeeId === employeeId ? res.employee : emp,
            ),
          };
        });
        const normalizedRow: Record<string, number | null> = {};
        for (const date of g.dates) {
          normalizedRow[date] = normalizeCellStatus(res.employee.cells[date]);
        }
        const savedExtraValues: RegisterExtras = {
          overtimeHours: res.employee.overtimeHours,
          nightAllowance: res.employee.nightAllowance,
          punctualityAward: res.employee.punctualityAward,
        };
        this.saved.update(current => ({
          ...current,
          [employeeId]: normalizedRow,
        }));
        this.draft.update(current => ({
          ...current,
          [employeeId]: { ...normalizedRow },
        }));
        this.savedExtras.update(current => ({
          ...current,
          [employeeId]: savedExtraValues,
        }));
        this.draftExtras.update(current => ({
          ...current,
          [employeeId]: { ...savedExtraValues },
        }));
        this.submittingEmployeeId.set(null);
        this.notification.success('Employee attendance saved.');
      },
      error: () => {
        this.notification.error('Failed to save employee attendance.');
        this.submittingEmployeeId.set(null);
      },
    });
  }

  bulk(action: 'mark_sundays' | 'mark_all_present' | 'clear_unmarked') {
    if (this.isLocked()) return;
    const g = this.grid();
    if (!g) return;

    this.draft.update(current => {
      const next = structuredClone(current);
      for (const emp of g.employees) {
        if (!next[emp.employeeId]) next[emp.employeeId] = {};
        for (const date of g.dates) {
          if (action === 'mark_sundays') {
            if (this.isSunday(date)) {
              next[emp.employeeId][date] = AttendanceStatusCode.WeekOff;
            }
          } else if (action === 'mark_all_present') {
            next[emp.employeeId][date] = AttendanceStatusCode.Present;
          } else {
            next[emp.employeeId][date] = null;
          }
        }
      }
      return next;
    });
    this.notification.info('Bulk changes applied locally. Submit each employee row to save.');
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importFile.set(file);
    this.attendanceService.previewImportFile(this.period, file).subscribe({
      next: p => {
        this.importPreview.set({
          valid: p.validRows.length,
          errors: p.errors.length,
          cells: p.totalCellsParsed,
        });
        this.showImportPanel.set(true);
      },
      error: (err) => this.notification.error(err?.error?.message ?? 'Failed to parse Excel file.'),
    });
    (event.target as HTMLInputElement).value = '';
  }

  applyImport() {
    const file = this.importFile();
    if (!file) return;
    this.saving.set(true);
    this.attendanceService.applyImportFile(this.period, file).subscribe({
      next: r => {
        this.grid.set(r.grid);
        this.initDraftFromGrid(r.grid);
        this.showImportPanel.set(false);
        this.importFile.set(null);
        this.saving.set(false);
        const reg = r.grid.register;
        if (reg.isComplete) {
          this.notification.success(
            `Imported ${r.applied} cell(s). Register is complete — you can Submit & Lock now.`,
          );
        } else {
          this.notification.warning(
            `Imported ${r.applied} cell(s). ${reg.unmarkedCells} cell(s) still unmarked before locking.`,
          );
        }
      },
      error: () => { this.notification.error('Import failed.'); this.saving.set(false); },
    });
  }

  downloadTemplate() {
    this.attendanceService.downloadTemplate(this.period).subscribe({
      next: blob => this.saveBlob(blob, `attendance-template-${this.period.year}-${this.period.month}.xlsx`),
    });
  }

  exportRegister() {
    this.attendanceService.exportRegister(this.period).subscribe({
      next: blob => this.saveBlob(blob, `attendance-register-${this.period.year}-${this.period.month}.xlsx`),
    });
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  openLockDialog() {
    this.verified.setValue(false);
    this.showLockDialog.set(true);
  }

  confirmLock() {
    if (!this.verified.value) {
      this.notification.warning('Please confirm verification against client sheet.');
      return;
    }
    if (!this.canLockRegister()) {
      this.notification.warning('Save all employee rows and mark every day before locking the register.');
      return;
    }
    this.saving.set(true);
    this.attendanceService.lockRegister({ ...this.period, verified: true }).subscribe({
      next: () => {
        this.showLockDialog.set(false);
        this.load();
        this.saving.set(false);
        this.notification.success('Register locked successfully.');
      },
      error: (err) => {
        this.notification.error(err?.error?.message ?? 'Failed to lock register.');
        this.saving.set(false);
      },
    });
  }

  confirmUnlock() {
    if (this.unlockReason.invalid) {
      this.unlockReason.markAsTouched();
      return;
    }
    this.saving.set(true);
    this.attendanceService.unlockRegister({
      ...this.period,
      reason: this.unlockReason.value!,
    }).subscribe({
      next: () => {
        this.showUnlockDialog.set(false);
        this.unlockReason.reset();
        this.load();
        this.saving.set(false);
        this.notification.success('Register unlocked for editing.');
      },
      error: () => { this.notification.error('Failed to unlock.'); this.saving.set(false); },
    });
  }

  dayLabel(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const mon = MONTH_NAMES[month - 1]?.slice(0, 3) ?? 'Jan';
    return `${String(day).padStart(2, '0')}-${mon}-${String(year).slice(-2)}`;
  }

  dayNumber(date: string): string {
    return date.slice(8, 10);
  }

  dayWeekday(date: string): string {
    const d = new Date(`${date}T12:00:00`);
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()] ?? '';
  }

  statusTitle(status: number | null | undefined): string {
    if (status == null) return 'Not marked';
    const opt = ATTENDANCE_STATUS_OPTIONS.find(o => o.value === status);
    return opt?.label ?? 'Unknown';
  }

  isSunday(date: string): boolean {
    const d = new Date(`${date}T12:00:00`);
    return d.getDay() === 0;
  }
}
