import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, } from '@angular/common';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { LoginHistoryService } from '../../../core/services/login-history.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { LoginHistoryItem } from '../../../core/services/login-history.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
@Component({
  selector: 'app-login-history-list',
    templateUrl: './login-history-list.component.html',
  styleUrl: './login-history-list.component.less',
})
export class LoginHistoryListComponent implements OnInit {
  private readonly loginHistoryService = inject(LoginHistoryService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<LoginHistoryItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl('');
  readonly cols = ['loggedInAt', 'userName', 'loginStatus', 'ipAddress', 'browser', 'isNewDevice'];

  readonly statusOptions = computed(() => [
    { key: '', value: 'All' },
    { key: 'success', value: 'Success' },
    { key: 'failed', value: 'Failed' },
    { key: 'locked', value: 'Locked' },
  ]);


  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.loginHistoryService.list({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      loginStatus: this.statusCtrl.value || undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load login history.');
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }
}
