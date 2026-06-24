import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { DepartmentService } from '../../../core/services/department.service';
import { ClientsService } from '../../../core/services/clients.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { runDeleteWithApproval } from '../../../core/utils/delete-record.util';
import { DepartmentListItem } from '../../../core/models/department.models';
import { ClientListItem } from '../../../core/models/client.models';
import { PaginatedResult } from '../../../core/models/api.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.less',
})
export class DepartmentListComponent implements OnInit {

  private readonly departmentService = inject(DepartmentService);
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<DepartmentListItem> | null>(null);
  readonly clients = signal<ClientListItem[]>([]);
  readonly viewMode = signal<'table' | 'hierarchy'>('table');
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<boolean | null>(null);
  readonly clientCtrl = new FormControl<string>('');
  readonly cols = ['departmentCode', 'departmentName', 'clientName', 'headOfDepartment', 'employeeCount', 'status', 'actions'];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    const queryClientId = this.route.snapshot.queryParamMap.get('clientId');
    if (queryClientId) {
      this.clientCtrl.setValue(queryClientId, { emitEvent: false });
    }

    this.clientsService.getAllForSelect().subscribe({
      next: clients => {
        this.clients.set(clients.filter(c => c.id && c.companyName));
        if (!this.clientCtrl.value && clients.length === 1) {
          this.clientCtrl.setValue(clients[0].id, { emitEvent: false });
        }
        this.load();
      },
      error: () => this.load(),
    });

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.clientCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    const clientId = this.clientCtrl.value?.trim();
    if (!clientId) {
      this.data.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.departmentService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      clientId,
      search: this.searchCtrl.value || undefined,
      isActive: this.statusCtrl.value ?? undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  addDepartmentLink(): string[] {
    const clientId = this.clientCtrl.value?.trim();
    return clientId ? ['/departments/new'] : ['/departments/new'];
  }

  addDepartmentQueryParams(): { clientId?: string } {
    const clientId = this.clientCtrl.value?.trim();
    return clientId ? { clientId } : {};
  }

  viewDepartment(id: string) {
    this.router.navigate(['/departments', id]);
  }

  editDepartment(id: string) {
    this.router.navigate(['/departments', id, 'edit']);
  }

  deleteDepartment(dept: DepartmentListItem) {
    runDeleteWithApproval({
      auth: this.authService,
      dialog: this.dialog,
      notification: this.notification,
      title: 'Delete Department',
      entityLabel: dept.departmentName,
      deleteFn: (reason) => this.departmentService.delete(dept.id, { reason }),
      onSuccess: () => this.load(),
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.searchCtrl.value?.trim() || this.statusCtrl.value !== null);
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
  }
}
