import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { LoginHistoryService } from '../../../core/services/login-history.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaginatedResult } from '../../../core/models/api.models';
import { LoginHistoryItem } from '../../../core/services/login-history.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-login-history-list',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './login-history-list.component.html',
  styleUrl: './login-history-list.component.less',
})
export class LoginHistoryListComponent implements OnInit {
  private readonly loginHistoryService = inject(LoginHistoryService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<LoginHistoryItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl('');
  readonly cols = ['loggedInAt', 'userName', 'loginStatus', 'ipAddress', 'browser', 'isNewDevice'];

  page = 1;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.loginHistoryService.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      loginStatus: this.statusCtrl.value || undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load login history.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }
}
