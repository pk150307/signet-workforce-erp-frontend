import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { PfEsicService } from '../../../../core/services/pf-esic.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PfEsicDetail, PfEsicStatus } from '../../../../core/models/pf-esic.models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../../core/utils/dialog.util';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

const UAN_PATTERN = /^\d{12}$/;
const ESIC_PATTERN = /^\d{17}$/;

@Component({
  selector: 'app-pf-esic-drawer',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './pf-esic-drawer.component.html',
  styleUrl: './pf-esic-drawer.component.less',
})
export class PfEsicDrawerComponent implements OnChanges {
  @Input({ required: true }) employeeId!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly pfEsicService = inject(PfEsicService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly detail = signal<PfEsicDetail | null>(null);
  readonly editing = signal(false);

  readonly statusOptions: PfEsicStatus[] = ['Active', 'Inactive', 'Pending', 'Suspended'];

  readonly form = this.fb.nonNullable.group({
    uanNumber: ['', [Validators.pattern(UAN_PATTERN)]],
    pfNumber: ['', [Validators.maxLength(22)]],
    esicNumber: ['', [Validators.pattern(ESIC_PATTERN)]],
    pfContributionEmployee: [12, [Validators.min(0), Validators.max(100)]],
    pfContributionEmployer: [12, [Validators.min(0), Validators.max(100)]],
    esicContributionEmployee: [0.75, [Validators.min(0), Validators.max(100)]],
    esicContributionEmployer: [3.25, [Validators.min(0), Validators.max(100)]],
    effectiveDate: [null as Date | null],
    status: ['Active' as PfEsicStatus, Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeeId'] && this.employeeId) {
      this.loadDetail();
    }
  }

  loadDetail(): void {
    this.loading.set(true);
    this.editing.set(false);
    this.pfEsicService.getByEmployeeId(this.employeeId).subscribe({
      next: detail => {
        this.detail.set(detail);
        this.patchForm(detail);
        this.loading.set(false);
      },
      error: () => {
        const mock = this.getMockDetail(this.employeeId);
        this.detail.set(mock);
        this.patchForm(mock);
        this.loading.set(false);
        this.notification.warning('Using sample data — API unavailable.');
      },
    });
  }

  startEdit(): void {
    this.editing.set(true);
  }

  cancelEdit(): void {
    const detail = this.detail();
    if (detail) {
      this.patchForm(detail);
    }
    this.editing.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, confirmDialogConfig({
      title: 'Save PF/ESIC Details',
      message: 'Are you sure you want to save these statutory details?',
      confirmLabel: 'Save',
      cancelLabel: 'Cancel',
      confirmColor: 'primary',
      icon: 'save',
    }));

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.submitSave();
    });
  }

  private submitSave(): void {
    const raw = this.form.getRawValue();
    this.saving.set(true);

    this.pfEsicService.update(this.employeeId, {
      uanNumber: raw.uanNumber || undefined,
      pfNumber: raw.pfNumber || undefined,
      esicNumber: raw.esicNumber || undefined,
      pfContributionEmployee: raw.pfContributionEmployee,
      pfContributionEmployer: raw.pfContributionEmployer,
      esicContributionEmployee: raw.esicContributionEmployee,
      esicContributionEmployer: raw.esicContributionEmployer,
      effectiveDate: raw.effectiveDate ? this.formatDate(raw.effectiveDate) : undefined,
      status: raw.status,
    }).subscribe({
      next: detail => {
        this.detail.set(detail);
        this.patchForm(detail);
        this.editing.set(false);
        this.saving.set(false);
        this.notification.success('PF/ESIC details saved successfully.');
        this.saved.emit();
      },
      error: () => {
        this.saving.set(false);
        this.notification.error('Failed to save PF/ESIC details.');
      },
    });
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

  private patchForm(detail: PfEsicDetail): void {
    this.form.patchValue({
      uanNumber: detail.uanNumber ?? '',
      pfNumber: detail.pfNumber ?? '',
      esicNumber: detail.esicNumber ?? '',
      pfContributionEmployee: detail.pfContributionEmployee ?? 12,
      pfContributionEmployer: detail.pfContributionEmployer ?? 12,
      esicContributionEmployee: detail.esicContributionEmployee ?? 0.75,
      esicContributionEmployer: detail.esicContributionEmployer ?? 3.25,
      effectiveDate: detail.effectiveDate ? new Date(detail.effectiveDate) : null,
      status: detail.status,
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private getMockDetail(employeeId: string): PfEsicDetail {
    return {
      id: employeeId,
      employeeId,
      employeeCode: 'EMP001',
      fullName: 'Sample Employee',
      department: 'Operations',
      designation: 'Supervisor',
      siteName: 'Main Site',
      uanNumber: '100012345678',
      pfNumber: 'MH/BAN/1234567/000/1234567',
      esicNumber: '12345678901234567',
      pfContributionEmployee: 12,
      pfContributionEmployer: 12,
      esicContributionEmployee: 0.75,
      esicContributionEmployer: 3.25,
      effectiveDate: '2024-04-01',
      status: 'Active',
      dateOfBirth: '1990-05-15',
      dateOfJoining: '2020-01-10',
      bankAccountNumber: '****4521',
      ifscCode: 'HDFC0001234',
      auditHistory: [
        {
          id: '1',
          action: 'Updated',
          field: 'uanNumber',
          oldValue: '—',
          newValue: '100012345678',
          changedBy: 'Admin User',
          changedAt: '2024-04-01T10:30:00Z',
        },
        {
          id: '2',
          action: 'Created',
          changedBy: 'System',
          changedAt: '2020-01-10T09:00:00Z',
        },
      ],
    };
  }
}
