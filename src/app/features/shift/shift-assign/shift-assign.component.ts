import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ShiftService } from '../../../core/services/shift.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ShiftListItem } from '../../../core/models/shift.models';

interface MockEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  currentShift?: string;
}

const MOCK_EMPLOYEES: MockEmployee[] = [
  { id: '1', employeeCode: 'EMP001', fullName: 'Amit Singh', department: 'Operations', currentShift: 'General Shift' },
  { id: '2', employeeCode: 'EMP002', fullName: 'Sneha Reddy', department: 'Operations', currentShift: 'Morning Shift' },
  { id: '3', employeeCode: 'EMP003', fullName: 'Rahul Mehta', department: 'Finance' },
  { id: '4', employeeCode: 'EMP004', fullName: 'Kavita Joshi', department: 'HR', currentShift: 'General Shift' },
  { id: '5', employeeCode: 'EMP005', fullName: 'Deepak Nair', department: 'IT', currentShift: 'Evening Shift' },
  { id: '6', employeeCode: 'EMP006', fullName: 'Pooja Verma', department: 'Sales', currentShift: 'General Shift' },
];

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-shift-assign',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgFor,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './shift-assign.component.html',
  styleUrl: './shift-assign.component.less',
})
export class ShiftAssignComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly shiftService = inject(ShiftService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly shifts = signal<ShiftListItem[]>([]);
  readonly employees = signal<MockEmployee[]>(MOCK_EMPLOYEES);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly searchCtrl = this.fb.control('');
  readonly cols = ['select', 'employeeCode', 'fullName', 'department', 'currentShift'];

  readonly form = this.fb.group({
    shiftId: ['', Validators.required],
    effectiveFrom: [new Date(), Validators.required],
  });

  ngOnInit() {
    const preselectedShift = this.route.snapshot.queryParams['shiftId'];
    if (preselectedShift) {
      this.form.patchValue({ shiftId: preselectedShift });
    }

    this.shiftService.getAll({ pageSize: 100 }).subscribe({
      next: (result) => {
        this.shifts.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get filteredEmployees(): MockEmployee[] {
    const term = (this.searchCtrl.value ?? '').toLowerCase();
    if (!term) return this.employees();
    return this.employees().filter(e =>
      e.fullName.toLowerCase().includes(term) ||
      e.employeeCode.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term)
    );
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleEmployee(id: string) {
    const next = new Set(this.selectedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedIds.set(next);
  }

  toggleAll(checked: boolean) {
    if (checked) {
      this.selectedIds.set(new Set(this.filteredEmployees.map(e => e.id)));
    } else {
      this.selectedIds.set(new Set());
    }
  }

  allSelected(): boolean {
    const filtered = this.filteredEmployees;
    return filtered.length > 0 && filtered.every(e => this.selectedIds().has(e.id));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) {
      this.notification.error('Select at least one employee.');
      return;
    }

    this.saving.set(true);
    const { shiftId, effectiveFrom } = this.form.getRawValue();
    this.shiftService.bulkAssign({
      shiftId: shiftId!,
      employeeIds: ids,
      effectiveFrom: effectiveFrom instanceof Date
        ? effectiveFrom.toISOString().split('T')[0]
        : String(effectiveFrom),
    }).subscribe({
      next: (result) => {
        this.notification.success(`Shift assigned to ${result.assigned} employees.`);
        this.router.navigate(['/shifts']);
      },
      error: () => {
        this.notification.error('Failed to assign shift.');
        this.saving.set(false);
      },
    });
  }
}
