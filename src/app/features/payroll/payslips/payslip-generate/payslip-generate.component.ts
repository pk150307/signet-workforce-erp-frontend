import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PayslipService } from '../../../../core/services/payslip.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmployeeListItem, EmployeeStatus } from '../../../../core/models/employee.models';
import { ClientListItem } from '../../../../core/models/client.models';
import { PAYSLIP_MONTHS } from '../payslip.mock';

import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-payslip-generate',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatCheckboxModule,
    MatTableModule,
  ],
  templateUrl: './payslip-generate.component.html',
  styleUrl: './payslip-generate.component.less',
})
export class PayslipGenerateComponent implements OnInit {

  private readonly payslipService = inject(PayslipService);
  private readonly employeeService = inject(EmployeeService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly generating = signal(false);
  readonly loadingEmployees = signal(false);
  readonly progress = signal(0);
  readonly employees = signal<EmployeeListItem[]>([]);
  readonly clients = signal<ClientListItem[]>([]);
  readonly selection = new SelectionModel<EmployeeListItem>(true, []);

  readonly months = PAYSLIP_MONTHS;
  readonly years = this.buildYearOptions();
  readonly displayedColumns = ['select', 'employeeCode', 'employeeName', 'department', 'siteName'];

  readonly searchCtrl = new FormControl('');

  readonly form = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, { nonNullable: true, validators: Validators.required }),
    year: new FormControl(new Date().getFullYear(), { nonNullable: true, validators: Validators.required }),
    clientId: new FormControl<string | null>(null),
  });

  readonly filteredEmployees = computed(() => {
    const term = (this.searchCtrl.value ?? '').trim().toLowerCase();
    const items = this.employees();
    if (!term) return items;
    return items.filter(e =>
      e.fullName.toLowerCase().includes(term) ||
      e.employeeCode.toLowerCase().includes(term),
    );
  });

  ngOnInit() {

    this.clientsService.getAllForSelect().subscribe({
      next: clients => this.clients.set(clients),
      error: () => this.notification.warning('Could not load clients.'),
    });

    this.loadEmployees();

    this.form.get('clientId')!.valueChanges.subscribe(() => {
      this.selection.clear();
      this.loadEmployees();
    });

    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.selection.clear();
    });
  }

  loadEmployees() {
    this.loadingEmployees.set(true);
    this.selection.clear();

    this.employeeService.getAllForSelect({
      status: EmployeeStatus.Active,
      clientId: this.form.get('clientId')!.value ?? undefined,
    }).subscribe({
      next: items => {
        this.employees.set(items);
        this.loadingEmployees.set(false);
      },
      error: () => {
        this.employees.set([]);
        this.loadingEmployees.set(false);
        this.notification.error('Failed to load employees.');
      },
    });
  }

  isAllSelected(): boolean {
    const items = this.filteredEmployees();
    return items.length > 0 && this.selection.selected.length === items.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.filteredEmployees());
    }
  }

  generate() {
    if (this.form.invalid || this.generating()) return;

    const { month, year, clientId } = this.form.getRawValue();
    const visible = this.filteredEmployees();
    if (!visible.length) {
      this.notification.warning('No employees match the current filters.');
      return;
    }

    const selected = this.selection.selected.filter(row => visible.some(v => v.id === row.id));
    const employeeIds = selected.length > 0 ? selected.map(e => e.id) : visible.map(e => e.id);

    this.generating.set(true);
    this.progress.set(10);

    this.payslipService.generate({
      month,
      year,
      clientId: clientId ?? undefined,
      employeeIds,
    }).subscribe({
      next: result => {
        this.progress.set(100);
        this.notification.success(`${result.generated} payslip(s) generated successfully.`);
        setTimeout(() => this.router.navigate(['/payroll/payslips'], {
          queryParams: { month, year, clientId: clientId ?? undefined },
        }), 800);
      },
      error: err => {
        this.generating.set(false);
        this.progress.set(0);
        this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Failed to generate payslips.');
      },
    });
  }

  private buildYearOptions(): number[] {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  }
}
