import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';
import { DesignationService } from '../../../core/services/designation.service';
import { DesignationGradeService } from '../../../core/services/designation-grade.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { DesignationDetail } from '../../../core/models/designation.models';
import { DesignationGradeListItem } from '../../../core/models/designation-grade.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-designation-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './designation-detail.component.html',
  styleUrl: './designation-detail.component.less',
})
export class DesignationDetailComponent implements OnInit {
  private readonly designationService = inject(DesignationService);
  private readonly gradeService = inject(DesignationGradeService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly gradesLoading = signal(false);
  readonly savingGrade = signal(false);
  readonly designation = signal<DesignationDetail | null>(null);
  readonly grades = signal<DesignationGradeListItem[]>([]);
  readonly showGradeForm = signal(false);
  readonly editingGradeId = signal<string | null>(null);

  readonly gradeForm = this.fb.group({
    gradeCode: ['', [Validators.required, Validators.maxLength(20)]],
    gradeName: ['', [Validators.required, Validators.maxLength(200)]],
    level: [1, [Validators.required, Validators.min(1), Validators.max(99)]],
    basicSalary: [0, [Validators.min(0)]],
    houseRentAllowance: [0, [Validators.min(0)]],
    specialAllowance: [0, [Validators.min(0)]],
    isPfApplicable: [true],
    isEsiApplicable: [true],
    employeePfPercentage: [12, [Validators.min(0), Validators.max(100)]],
    employeeEsiPercentage: [0.75, [Validators.min(0), Validators.max(100)]],
    isLwfApplicable: [false],
    employeeLwfPercentage: [0.2, [Validators.min(0), Validators.max(100)]],
    isActive: [true],
  });

  private designationId = '';

  ngOnInit() {
    this.designationId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load(this.designationId);
  }

  load(id: string) {
    this.loading.set(true);
    forkJoin({
      designation: this.designationService.getById(id),
      grades: this.gradeService.getByDesignation(id),
    }).subscribe({
      next: ({ designation, grades }) => {
        this.designation.set(designation);
        this.grades.set(grades);
        this.breadcrumbService.updateLast(designation.designationName);
        this.loading.set(false);
      },
      error: () => {
        this.designation.set(null);
        this.notification.error('Failed to load designation details.');
        this.loading.set(false);
      },
    });
  }

  loadGrades(designationId: string) {
    this.gradesLoading.set(true);
    this.gradeService.getByDesignation(designationId).subscribe({
      next: (items) => {
        this.grades.set(items);
        this.gradesLoading.set(false);
      },
      error: () => {
        this.grades.set([]);
        this.gradesLoading.set(false);
      },
    });
  }

  openAddGrade() {
    this.editingGradeId.set(null);
    this.gradeForm.reset({
      gradeCode: '',
      gradeName: '',
      level: (this.grades().length || 0) + 1,
      basicSalary: 0,
      houseRentAllowance: 0,
      specialAllowance: 0,
      isPfApplicable: true,
      isEsiApplicable: true,
      employeePfPercentage: 12,
      employeeEsiPercentage: 0.75,
      isLwfApplicable: false,
      employeeLwfPercentage: 0.2,
      isActive: true,
    });
    this.showGradeForm.set(true);
  }

  openEditGrade(grade: DesignationGradeListItem) {
    this.editingGradeId.set(grade.id);
    this.gradeForm.patchValue({
      gradeCode: grade.gradeCode,
      gradeName: grade.gradeName,
      level: grade.level,
      basicSalary: grade.basicSalary,
      houseRentAllowance: grade.houseRentAllowance,
      specialAllowance: grade.specialAllowance,
      isPfApplicable: grade.isPfApplicable,
      isEsiApplicable: grade.isEsiApplicable,
      employeePfPercentage: grade.employeePfPercentage,
      employeeEsiPercentage: grade.employeeEsiPercentage,
      isLwfApplicable: grade.isLwfApplicable,
      employeeLwfPercentage: grade.employeeLwfPercentage,
      isActive: grade.isActive,
    });
    this.showGradeForm.set(true);
  }

  cancelGradeForm() {
    this.showGradeForm.set(false);
    this.editingGradeId.set(null);
  }

  saveGrade() {
    if (this.gradeForm.invalid || !this.designation()) {
      this.gradeForm.markAllAsTouched();
      return;
    }

    this.savingGrade.set(true);
    const raw = this.gradeForm.getRawValue();
    const payload = {
      designationId: this.designationId,
      gradeCode: raw.gradeCode!.trim().toUpperCase(),
      gradeName: raw.gradeName!.trim(),
      level: Number(raw.level),
      basicSalary: Number(raw.basicSalary ?? 0),
      houseRentAllowance: Number(raw.houseRentAllowance ?? 0),
      specialAllowance: Number(raw.specialAllowance ?? 0),
      isPfApplicable: raw.isPfApplicable ?? true,
      isEsiApplicable: raw.isEsiApplicable ?? true,
      employeePfPercentage: Number(raw.employeePfPercentage ?? 12),
      employeeEsiPercentage: Number(raw.employeeEsiPercentage ?? 0.75),
      isLwfApplicable: raw.isLwfApplicable ?? false,
      employeeLwfPercentage: Number(raw.employeeLwfPercentage ?? 0.2),
      isActive: raw.isActive ?? true,
    };

    const editId = this.editingGradeId();
    const req$ = editId
      ? this.gradeService.update(editId, payload)
      : this.gradeService.create(payload);

    req$.subscribe({
      next: () => {
        this.notification.success(editId ? 'Grade updated.' : 'Grade created.');
        this.savingGrade.set(false);
        this.showGradeForm.set(false);
        this.editingGradeId.set(null);
        this.loadGrades(this.designationId);
      },
      error: () => {
        this.notification.error('Failed to save grade.');
        this.savingGrade.set(false);
      },
    });
  }

  deleteGrade(grade: DesignationGradeListItem) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Pay Grade',
        message: `Delete grade "${grade.gradeCode} — ${grade.gradeName}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.gradeService.delete(grade.id).subscribe({
        next: () => {
          this.notification.success('Grade deleted.');
          this.loadGrades(this.designationId);
        },
        error: () => this.notification.error('Failed to delete grade.'),
      });
    });
  }

  gradeGross(): number {
    const v = this.gradeForm.getRawValue();
    return (
      Number(v.basicSalary ?? 0) +
      Number(v.houseRentAllowance ?? 0) +
      Number(v.specialAllowance ?? 0)
    );
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'D';
  }

  display(value: string | number | null | undefined): string {
    if (value == null || value === '') return '—';
    return String(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }
}
