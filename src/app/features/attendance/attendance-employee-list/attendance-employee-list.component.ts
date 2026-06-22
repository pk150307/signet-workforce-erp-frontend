import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ClientsService } from '../../../core/services/clients.service';
import {
  AttendanceEmployeeListItem,
  AttendanceRegisterMeta,
  MONTH_NAMES,
  rowStatusLabel,
} from '../../../core/models/attendance.models';
import { ClientListItem } from '../../../core/models/client.models';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-attendance-employee-list',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf, NgFor, DatePipe, DecimalPipe, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule,
  ],
  templateUrl: './attendance-employee-list.component.html',
  styleUrl: './attendance-employee-list.component.less',
})
export class AttendanceEmployeeListComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);

  readonly clientsLoading = signal(true);
  readonly loading = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  readonly items = signal<AttendanceEmployeeListItem[]>([]);
  readonly register = signal<AttendanceRegisterMeta | null>(null);
  readonly monthNames = MONTH_NAMES;
  readonly rowStatusLabel = rowStatusLabel;
  readonly cols = ['employee', 'department', 'site', 'present', 'absent', 'leave', 'overtime', 'night', 'punctuality', 'unmarked', 'status', 'actions'];

  readonly filters = new FormGroup({
    clientId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    month: new FormControl(new Date().getMonth() + 1, { nonNullable: true }),
    year: new FormControl(new Date().getFullYear(), { nonNullable: true }),
  });

  readonly years = [2024, 2025, 2026, 2027];

  ngOnInit() {
    this.clientsLoading.set(true);
    this.clientsService.getAllForSelect().subscribe({
      next: c => {
        this.clients.set(c);
        this.clientsLoading.set(false);
      },
      error: () => this.clientsLoading.set(false),
    });
    this.filters.valueChanges.subscribe(() => this.load());
    this.load();
  }

  load() {
    const v = this.filters.getRawValue();
    if (!v.clientId) return;
    this.loading.set(true);
    this.attendanceService.getEmployeeList(v).subscribe({
      next: res => {
        this.register.set(res.register);
        this.items.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openRegister() {
    const v = this.filters.getRawValue();
    this.router.navigate(['/attendance/register'], {
      queryParams: { clientId: v.clientId, month: v.month, year: v.year },
    });
  }
}
