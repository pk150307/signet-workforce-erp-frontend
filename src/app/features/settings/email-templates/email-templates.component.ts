import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { SettingsService } from '../../../core/services/settings.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { EmailTemplateItem } from '../../../core/models/settings.models';

@Component({
  selector: 'app-email-templates',
  templateUrl: './email-templates.component.html',
  styleUrl: './email-templates.component.less',
})
export class EmailTemplatesComponent implements OnInit {
  private readonly service = inject(SettingsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly usingLocalData = signal(true);
  readonly data = signal<CursorPaginatedResult<EmailTemplateItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');


  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.service.getEmailTemplates({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.usingLocalData.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(emptyCursorPage(this.pager.pageSize));
        this.pager.reset();
        this.loading.set(false);
        this.notification.error('Failed to load email templates.');
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }
}
