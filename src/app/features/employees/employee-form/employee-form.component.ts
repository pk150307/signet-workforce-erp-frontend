import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Gender, EmploymentType, GENDER_LABELS, EMPLOYMENT_TYPE_LABELS } from '../../../core/models/employee.models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.less',
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isEdit = signal(false);
  private employeeId: string | null = null;

  readonly genderOptions = Object.entries(GENDER_LABELS).map(([k, v]) => ({ value: +k, label: v }));
  readonly employmentTypeOptions = Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => ({ value: +k, label: v }));

  readonly personalForm = this.fb.group({
    firstName:    ['', [Validators.required, Validators.maxLength(100)]],
    lastName:     ['', [Validators.required, Validators.maxLength(100)]],
    email:        ['', [Validators.required, Validators.email]],
    phone:        ['', [Validators.required, Validators.maxLength(20)]],
    alternatePhone: [''],
    dateOfBirth:  [null as Date | null, Validators.required],
    gender:       [null as Gender | null, Validators.required],
  });

  readonly employmentForm = this.fb.group({
    joiningDate:      [null as Date | null, Validators.required],
    employmentType:   [null as EmploymentType | null, Validators.required],
    departmentId:     ['', Validators.required],
    designationId:    ['', Validators.required],
    reportingManagerId: [''],
    siteId:           [''],
  });

  readonly addressForm = this.fb.group({
    presentAddress:  [''],
    permanentAddress: [''],
    city:            [''],
    state:           [''],
    pinCode:         [''],
  });

  readonly salaryForm = this.fb.group({
    basicSalary:  [0, [Validators.required, Validators.min(0)]],
    grossSalary:  [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'];
    if (this.employeeId) {
      this.isEdit.set(true);
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.employeeService.getById(id).subscribe({
      next: (emp) => {
        this.personalForm.patchValue({
          firstName: emp.firstName, lastName: emp.lastName,
          email: emp.email, phone: emp.phone, alternatePhone: emp.alternatePhone ?? '',
          dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth) : null,
          gender: emp.gender,
        });
        this.employmentForm.patchValue({
          joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : null,
          employmentType: emp.employmentType,
          departmentId: emp.departmentId, designationId: emp.designationId,
          reportingManagerId: emp.reportingManagerId ?? '',
          siteId: emp.siteId ?? '',
        });
        this.addressForm.patchValue({
          presentAddress: emp.presentAddress ?? '', permanentAddress: emp.permanentAddress ?? '',
          city: emp.city ?? '', state: emp.state ?? '', pinCode: emp.pinCode ?? '',
        });
        this.salaryForm.patchValue({ basicSalary: emp.basicSalary, grossSalary: emp.grossSalary });
        this.loading.set(false);
      },
      error: () => { this.notification.error('Failed to load employee.'); this.loading.set(false); }
    });
  }

  onSubmit() {
    if (this.personalForm.invalid || this.employmentForm.invalid || this.salaryForm.invalid) {
      this.personalForm.markAllAsTouched();
      this.employmentForm.markAllAsTouched();
      this.salaryForm.markAllAsTouched();
      return;
    }

    const p = this.personalForm.getRawValue();
    const e = this.employmentForm.getRawValue();
    const a = this.addressForm.getRawValue();
    const s = this.salaryForm.getRawValue();

    const payload = {
      id: this.employeeId!,
      firstName: p.firstName!, lastName: p.lastName!,
      email: p.email!, phone: p.phone!,
      alternatePhone: p.alternatePhone || undefined,
      dateOfBirth: p.dateOfBirth ? this.formatDate(p.dateOfBirth) : '',
      gender: p.gender!,
      joiningDate: e.joiningDate ? this.formatDate(e.joiningDate) : '',
      employmentType: e.employmentType!,
      departmentId: e.departmentId!, designationId: e.designationId!,
      reportingManagerId: e.reportingManagerId || undefined,
      siteId: e.siteId || undefined,
      presentAddress: a.presentAddress || undefined, permanentAddress: a.permanentAddress || undefined,
      city: a.city || undefined, state: a.state || undefined, pinCode: a.pinCode || undefined,
      basicSalary: s.basicSalary!, grossSalary: s.grossSalary!,
    };

    this.saving.set(true);
    if (this.isEdit()) {
      this.employeeService.update(this.employeeId!, payload).subscribe({
        next: () => {
          this.notification.success('Employee updated successfully.');
          this.router.navigate(['/employees', this.employeeId]);
        },
        error: () => { this.notification.error('Failed to save employee.'); this.saving.set(false); }
      });
    } else {
      this.employeeService.create(payload).subscribe({
        next: (result) => {
          this.notification.success('Employee created successfully.');
          this.router.navigate(['/employees', result.id]);
        },
        error: () => { this.notification.error('Failed to save employee.'); this.saving.set(false); }
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  cancel() { this.router.navigate(['/employees']); }
}
