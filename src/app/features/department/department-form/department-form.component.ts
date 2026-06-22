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

import { DepartmentService } from '../../../core/services/department.service';
import { ClientsService } from '../../../core/services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateDepartmentRequest } from '../../../core/models/department.models';
import { ClientListItem } from '../../../core/models/client.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-department-form',
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
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.less',
})
export class DepartmentFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  private departmentId: string | null = null;

  readonly form = this.fb.group({
    clientId: ['', Validators.required],
    departmentCode: ['', Validators.required],
    departmentName: ['', Validators.required],
    parentDepartmentId: [''],
    description: [''],
    isActive: [true],
  });

  ngOnInit() {
    this.departmentId = this.route.snapshot.params['id'] ?? null;
    const queryClientId = this.route.snapshot.queryParamMap.get('clientId') ?? '';

    this.form.get('clientId')?.valueChanges.subscribe(clientId => {
      if (!this.isEdit() && clientId) {
        this.suggestDepartmentCode(clientId);
      }
    });

    this.clientsService.getAllForSelect().subscribe({
      next: clients => {
        this.clients.set(clients.filter(c => c.id && c.companyName));
        if (!this.departmentId && queryClientId) {
          this.form.patchValue({ clientId: queryClientId });
        } else if (!this.departmentId && clients.length === 1) {
          this.form.patchValue({ clientId: clients[0].id });
        }
      },
    });

    if (this.departmentId) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.departmentService.getById(this.departmentId).subscribe({
        next: (dept) => {
          this.form.patchValue(dept);
          this.form.get('clientId')?.disable();
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('Failed to load department.');
          this.loading.set(false);
          this.router.navigate(['/departments']);
        },
      });
    }
  }

  private suggestDepartmentCode(clientId: string) {
    this.departmentService.getNextCode(clientId).subscribe({
      next: ({ code }) => this.form.patchValue({ departmentCode: code }, { emitEvent: false }),
      error: () => this.notification.warning('Could not suggest a department code.'),
    });
  }

  cancel() {
    const clientId = this.form.getRawValue().clientId;
    this.router.navigate(clientId ? ['/departments'] : ['/departments'], {
      queryParams: clientId ? { clientId } : undefined,
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue() as CreateDepartmentRequest;

    if (this.isEdit()) {
      this.departmentService.update(this.departmentId!, payload).subscribe({
        next: () => {
          this.notification.success('Department saved.');
          this.router.navigate(['/departments'], {
            queryParams: payload.clientId ? { clientId: payload.clientId } : undefined,
          });
        },
        error: () => {
          this.notification.error('Failed to save department.');
          this.saving.set(false);
        },
      });
      return;
    }

    this.departmentService.create(payload).subscribe({
      next: () => {
        this.notification.success('Department saved.');
        this.router.navigate(['/departments'], {
          queryParams: payload.clientId ? { clientId: payload.clientId } : undefined,
        });
      },
      error: () => {
        this.notification.error('Failed to save department.');
        this.saving.set(false);
      },
    });
  }
}
