import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceFilterService } from '../../../core/services/attendance-filter.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';
import { ClientsService } from '../../../core/services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClientListItem } from '../../../core/models/client.models';
import {
  AttendanceGridResponse,
  MONTH_NAMES,
  RegisterPeriod,
} from '../../../core/models/attendance.models';

interface RegisterExtras {
  presentDays: number | null;
  overtimeHours: number;
  nightAllowance: number;
  punctualityAward: number;
  bonus: number;
}

type RegisterExtrasMap = Record<string, RegisterExtras>;

const EMPTY_EXTRAS: RegisterExtras = {
  presentDays: null,
  overtimeHours: 0,
  nightAllowance: 0,
  punctualityAward: 0,
  bonus: 0,
};

function extrasEqual(a: RegisterExtras, b: RegisterExtras): boolean {
  return a.presentDays === b.presentDays
    && a.overtimeHours === b.overtimeHours
    && a.nightAllowance === b.nightAllowance
    && a.punctualityAward === b.punctualityAward
    && a.bonus === b.bonus;
}

@Component({
  selector: 'app-attendance-register',
  templateUrl: './attendance-register.component.html',
  styleUrl: './attendance-register.component.less',
})
export class AttendanceRegisterComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly attendanceFilter = inject(AttendanceFilterService);
  private readonly clientsService = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  private skipFilterReload = false;

  readonly loading = signal(true);
  readonly clientsLoading = signal(true);
  readonly clients = signal<ClientListItem[]>([]);
  readonly saving = signal(false);
  readonly submittingEmployeeId = signal<string | null>(null);
  readonly grid = signal<AttendanceGridResponse | null>(null);
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

  readonly clientOptions = computed(() =>
    this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  );

  readonly monthOptions = computed(() =>
    this.monthNames.map((name, i) => ({ key: String(i + 1), value: name })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

  readonly filters = new FormGroup({
    clientId: new FormControl(this.attendanceFilter.clientIdOrEmpty(), { nonNullable: true, validators: Validators.required }),
    month: new FormControl(this.attendanceFilter.month(), { nonNullable: true }),
    year: new FormControl(this.attendanceFilter.year(), { nonNullable: true }),
  });

  period!: RegisterPeriod;

  readonly isLocked = computed(() => this.grid()?.register.status === 'locked');

  readonly pendingChanges = computed(() => {
    const g = this.grid();
    const draftExtras = this.draftExtras();
    const savedExtras = this.savedExtras();
    if (!g) return {} as Record<string, boolean>;

    const result: Record<string, boolean> = {};
    for (const emp of g.employees) {
      result[emp.employeeId] = !extrasEqual(
        draftExtras[emp.employeeId] ?? EMPTY_EXTRAS,
        savedExtras[emp.employeeId] ?? EMPTY_EXTRAS,
      );
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
      return `${g.register.unmarkedCells} employee(s) still missing present days.`;
    }
    return '';
  });

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    if (q.get('clientId')) {
      this.attendanceFilter.patch({
        clientId: q.get('clientId'),
        month: Number(q.get('month')) || this.attendanceFilter.month(),
        year: Number(q.get('year')) || this.attendanceFilter.year(),
      });
    }

    this.skipFilterReload = true;
    const stored = this.attendanceFilter.filters();
    this.filters.patchValue({
      clientId: stored.clientId ?? '',
      month: stored.month,
      year: stored.year,
    }, { emitEvent: false });
    this.skipFilterReload = false;

    if (!this.filters.value.clientId) {
      this.router.navigate(['/attendance']);
      return;
    }

    this.syncPeriodFromFilters();

    this.attendanceFilter.bindControls(
      {
        month: this.filters.controls.month,
        year: this.filters.controls.year,
        clientId: this.filters.controls.clientId,
      },
      this.destroyRef,
      () => this.onFiltersChanged(),
    );

    this.clientsService.getAllForSelect().subscribe({
      next: clients => {
        this.clients.set(clients);
        this.clientsLoading.set(false);
      },
      error: () => this.clientsLoading.set(false),
    });

    this.load();
  }

  clientLabel(clientId: string | undefined): string {
    if (!clientId) return 'Client';
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
    const extras: RegisterExtrasMap = {};
    for (const key of Object.keys(this.presentDaysText)) {
      delete this.presentDaysText[key];
    }
    for (const emp of g.employees) {
      extras[emp.employeeId] = {
        presentDays: emp.presentDays ?? null,
        overtimeHours: emp.overtimeHours ?? 0,
        nightAllowance: emp.nightAllowance ?? 0,
        punctualityAward: emp.punctualityAward ?? 0,
        bonus: emp.bonus ?? 0,
      };
    }
    this.draftExtras.set(structuredClone(extras));
    this.savedExtras.set(structuredClone(extras));
  }

  getExtras(employeeId: string): RegisterExtras {
    return this.draftExtras()[employeeId] ?? EMPTY_EXTRAS;
  }

  /** Keep decimal mid-entry (e.g. "25.") without coercing through Number on every keystroke. */
  private readonly presentDaysText: Record<string, string> = {};

  presentDaysDisplay(employeeId: string): string {
    if (Object.prototype.hasOwnProperty.call(this.presentDaysText, employeeId)) {
      return this.presentDaysText[employeeId];
    }
    const value = this.getExtras(employeeId).presentDays;
    return value == null ? '' : String(value);
  }

  onPresentDaysChange(employeeId: string, rawValue: string | number | null) {
    if (this.isLocked()) return;
    const text = rawValue == null ? '' : String(rawValue).replace(/[^\d.]/g, '');
    const cleaned = text.replace(/(\..*)\./g, '$1');
    this.presentDaysText[employeeId] = cleaned;

    let value: number | null = null;
    if (cleaned !== '' && cleaned !== '.') {
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        value = Math.min(31, Math.max(0, parsed));
      }
    }

    this.draftExtras.update(current => ({
      ...current,
      [employeeId]: { ...(current[employeeId] ?? EMPTY_EXTRAS), presentDays: value },
    }));
  }

  onExtraChange(employeeId: string, field: keyof RegisterExtras, rawValue: string | number | null) {
    if (this.isLocked()) return;
    if (field === 'presentDays') {
      this.onPresentDaysChange(employeeId, rawValue);
      return;
    }
    const value = Math.max(0, Number(rawValue) || 0);
    this.draftExtras.update(current => ({
      ...current,
      [employeeId]: { ...(current[employeeId] ?? EMPTY_EXTRAS), [field]: value },
    }));
  }

  hasPendingChanges(employeeId: string): boolean {
    return this.pendingChanges()[employeeId] ?? false;
  }

  submitEmployee(employeeId: string) {
    if (this.isLocked() || !this.hasPendingChanges(employeeId)) return;
    const extras = this.getExtras(employeeId);
    if (extras.presentDays == null) {
      this.notification.warning('Enter present days before submitting.');
      return;
    }

    this.submittingEmployeeId.set(employeeId);
    this.attendanceService.submitEmployeeRow(employeeId, {
      ...this.period,
      presentDays: extras.presentDays,
      overtimeHours: extras.overtimeHours,
      nightAllowance: extras.nightAllowance,
      punctualityAward: extras.punctualityAward,
      bonus: extras.bonus,
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
        const savedExtraValues: RegisterExtras = {
          presentDays: res.employee.presentDays,
          overtimeHours: res.employee.overtimeHours,
          nightAllowance: res.employee.nightAllowance,
          punctualityAward: res.employee.punctualityAward,
          bonus: res.employee.bonus,
        };
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
      error: (err) => {
        this.notification.error(err?.error?.message ?? 'Failed to save employee attendance.');
        this.submittingEmployeeId.set(null);
      },
    });
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
            `Imported ${r.applied} employee row(s). Register is complete — you can Submit & Lock now.`,
          );
        } else {
          this.notification.warning(
            `Imported ${r.applied} employee row(s). ${reg.unmarkedCells} employee(s) still missing present days.`,
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
    this.attendanceService.exportRegister(this.period, 'excel').subscribe({
      next: blob => this.saveBlob(blob, `attendance-register-${this.period.year}-${this.period.month}.xlsx`),
    });
  }

  exportRegisterPdf() {
    this.attendanceService.exportRegister(this.period, 'pdf').subscribe({
      next: blob => this.saveBlob(blob, `attendance-register-${this.period.year}-${this.period.month}.pdf`),
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
      this.notification.warning('Save all employee rows with present days before locking the register.');
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
}
