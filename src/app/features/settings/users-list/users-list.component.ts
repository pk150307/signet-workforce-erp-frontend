import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { SettingsService } from '../../../core/services/settings.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaginatedResult } from '../../../core/models/api.models';
import { UserListItem } from '../../../core/models/settings.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.less',
})
export class UsersListComponent implements OnInit {

  private readonly service = inject(SettingsService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly usingMock = signal(false);
  readonly data = signal<PaginatedResult<UserListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly cols = ["userName","email","roleName","isActive","lastLogin"];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.breadcrumbService.setItems([{"label":"Settings","route":"/settings"},{"label":"Users"}]);
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.service.getUsers({ page: this.page, pageSize: this.pageSize, search: this.searchCtrl.value || undefined }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.usingMock.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.usingMock.set(true);
        this.loading.set(false);
        this.notification.info('Showing sample data.');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }
}
