import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { forkJoin } from 'rxjs';

import { DesignationService } from '../../../core/services/designation.service';
import { DepartmentService } from '../../../core/services/department.service';
import { ClientsService } from '../../../core/services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateDesignationRequest } from '../../../core/models/designation.models';
import { DepartmentListItem } from '../../../core/models/department.models';
import { ClientListItem } from '../../../core/models/client.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-designation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './designation-form.component.html',
  styleUrl: './designation-form.component.less',
})
export class DesignationFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly designationService = inject(DesignationService);
  private readonly departmentService = inject(DepartmentService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly departments = signal<DepartmentListItem[]>([]);
  readonly clients = signal<ClientListItem[]>([]);
  private designationId: string | null = null;

  readonly form = this.fb.group({
    clientId: ['', Validators.required],
    designationCode: ['', Validators.required],
    designationName: ['', Validators.required],
    parentDesignationId: [''],
    departmentId: ['', Validators.required],
    description: [''],
    isActive: [true],
  });

  ngOnInit() {
    this.designationId = this.route.snapshot.params['id'] ?? null;
    const queryClientId = this.route.snapshot.queryParamMap.get('clientId') ?? '';
    this.loading.set(true);

    this.form.get('clientId')?.valueChanges.subscribe(clientId => {
      this.loadDepartmentsForClient(clientId ?? '');
      if (!this.isEdit()) {
        this.form.patchValue({ departmentId: '', designationCode: '' }, { emitEvent: false });
      }
    });

    this.form.get('departmentId')?.valueChanges.subscribe(departmentId => {
      if (!this.isEdit() && departmentId) {
        this.suggestDesignationCode(departmentId);
      }
    });

    if (this.designationId) {
      this.isEdit.set(true);
      forkJoin({
        clients: this.clientsService.getAllForSelect(),
        designation: this.designationService.getById(this.designationId),
      }).subscribe({
        next: ({ clients, designation }) => {
          this.clients.set(clients.filter(c => c.id && c.companyName));
          const clientId = designation.clientId ?? queryClientId;
          this.form.patchValue({
            clientId,
            designationCode: designation.designationCode,
            designationName: designation.designationName,
            departmentId: designation.departmentId ?? '',
            parentDesignationId: designation.parentDesignationId ?? '',
            description: designation.description ?? '',
            isActive: designation.isActive,
          });
          this.form.get('clientId')?.disable();
          if (clientId) {
            this.loadDepartmentsForClient(clientId, designation.departmentId ?? undefined);
          } else {
            this.loading.set(false);
          }
        },
        error: () => {
          this.notification.error('Failed to load designation.');
          this.loading.set(false);
          this.router.navigate(['/designations']);
        },
      });
      return;
    }

    this.clientsService.getAllForSelect().subscribe({
      next: clients => {
        this.clients.set(clients.filter(c => c.id && c.companyName));
        if (queryClientId) {
          this.form.patchValue({ clientId: queryClientId });
        } else if (clients.length === 1) {
          this.form.patchValue({ clientId: clients[0].id });
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.notification.error('Failed to load clients.');
        this.loading.set(false);
        this.router.navigate(['/designations']);
      },
    });
  }

  private loadDepartmentsForClient(clientId: string, preferredDepartmentId?: string) {
    if (!clientId) {
      this.departments.set([]);
      this.loading.set(false);
      return;
    }
    this.departmentService.getAllForSelect({ clientId, isActive: true }).subscribe({
      next: departments => {
        this.departments.set(departments.filter(d => d.id && d.departmentName));
        if (preferredDepartmentId) {
          this.form.patchValue({ departmentId: preferredDepartmentId }, { emitEvent: false });
        }
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load departments.');
        this.loading.set(false);
      },
    });
  }

  private suggestDesignationCode(departmentId: string) {
    this.designationService.getNextCode(departmentId).subscribe({
      next: ({ code }) => this.form.patchValue({ designationCode: code }, { emitEvent: false }),
      error: () => this.notification.warning('Could not suggest a designation code.'),
    });
  }

  cancel() {
    const clientId = this.form.getRawValue().clientId;
    this.router.navigate(['/designations'], {
      queryParams: clientId ? { clientId } : undefined,
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { clientId: _clientId, ...payload } = this.form.getRawValue() as CreateDesignationRequest & { clientId: string };

    if (this.isEdit()) {
      this.designationService.update(this.designationId!, payload).subscribe({
        next: () => {
          this.notification.success('Designation saved.');
          this.cancel();
        },
        error: () => {
          this.notification.error('Failed to save designation.');
          this.saving.set(false);
        },
      });
      return;
    }

    this.designationService.create(payload).subscribe({
      next: () => {
        this.notification.success('Designation saved.');
        this.cancel();
      },
      error: () => {
        this.notification.error('Failed to save designation.');
        this.saving.set(false);
      },
    });
  }

  compareSelectValue = (a: unknown, b: unknown): boolean => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  };
}
