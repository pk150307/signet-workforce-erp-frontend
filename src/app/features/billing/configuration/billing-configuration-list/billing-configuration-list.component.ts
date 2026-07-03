import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime } from 'rxjs';
import { BillingConfigurationService } from '../../../../core/services/billing-configuration.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BillingConfigurationListItem } from '../../../../core/models/billing.models';
import { PaginatedResult } from '../../../../core/models/api.models';
import { BillingSubnavComponent } from '../../shared/billing-subnav.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-billing-configuration-list',
  standalone: true,
  imports: [
    NgIf, NgFor, DecimalPipe, RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    BillingSubnavComponent, SkeletonLoaderComponent, EmptyStateComponent,
  ],
  templateUrl: './billing-configuration-list.component.html',
  styleUrl: './billing-configuration-list.component.less',
})
export class BillingConfigurationListComponent implements OnInit {
  private readonly service = inject(BillingConfigurationService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<BillingConfigurationListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly cols = ['site', 'client', 'billingType', 'gstPct', 'serviceCharge', 'headcount', 'status', 'actions'];
  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350)).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.billingFilter.filterChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.service.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      clientId: this.billingFilter.clientIdOrUndefined(),
    }).subscribe({
      next: r => { this.data.set(r); this.loading.set(false); },
      error: () => { this.notification.error('Failed to load configurations.'); this.loading.set(false); },
    });
  }

  onPage(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }
}
