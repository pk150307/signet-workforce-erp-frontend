import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientsService } from '../../../core/services/clients.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { runDeleteWithApproval } from '../../../core/utils/delete-record.util';
import { ClientListItem } from '../../../core/models/client.models';
import { PaginatedResult } from '../../../core/models/api.models';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgFor,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.less',
})
export class ClientListComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly searchCtrl = new FormControl('');
  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<ClientListItem> | null>(null);
  readonly cols = ['clientCode', 'companyName', 'contactPerson', 'location', 'status', 'actions'];

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => this.load());
  }

  load() {
    this.loading.set(true);
    this.clientsService.getAll({
      page: 1,
      pageSize: 20,
      search: this.searchCtrl.value || undefined,
    }).subscribe({
      next: r => { this.data.set(r); this.loading.set(false); },
      error: () => {
        this.data.set({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
        this.loading.set(false);
      },
    });
  }

  deleteClient(client: ClientListItem) {
    runDeleteWithApproval({
      auth: this.authService,
      dialog: this.dialog,
      notification: this.notification,
      title: 'Delete Client',
      entityLabel: client.companyName,
      deleteFn: (reason) => this.clientsService.delete(client.id, { reason }),
      onSuccess: () => this.load(),
    });
  }
}
