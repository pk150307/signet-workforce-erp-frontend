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
import { NotificationService } from '../../../core/services/notification.service';
import { PaginatedResult } from '../../../core/models/api.models';
import { PermissionListItem } from '../../../core/models/settings.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-permissions-list',
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
  templateUrl: './permissions-list.component.html',
  styleUrl: './permissions-list.component.less',
})
export class PermissionsListComponent implements OnInit {

  private readonly service = inject(SettingsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly usingMock = signal(false);
  readonly data = signal<PaginatedResult<PermissionListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly cols = ["permissionCode","permissionName","module","description"];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.service.getPermissions({ page: this.page, pageSize: this.pageSize, search: this.searchCtrl.value || undefined }).subscribe({
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
