import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LeaveService } from '../../../core/services/leave.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { PaginatedResult } from '../../../core/models/api.models';
import { LeaveBalance } from '../../../core/models/leave.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({ selector: 'app-leave-balance', standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, EmptyStateComponent, SkeletonLoaderComponent],
  templateUrl: './leave-balance.component.html', styleUrl: './leave-balance.component.less' })
export class LeaveBalanceComponent implements OnInit {
  private readonly leaveService = inject(LeaveService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<LeaveBalance> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly cols = ["employeeName","leaveType","allocated","used","balance"];
  page = 1; pageSize = 20;
  ngOnInit() {
    this.breadcrumbService.setItems([{ label: 'Leave', route: '/leave' }, { label: 'Balance' }]);
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => { this.page = 1; this.load(); });
  }
  load() { this.loading.set(true); this.leaveService.getBalances({ page: this.page, pageSize: this.pageSize, search: this.searchCtrl.value || undefined }).subscribe({ next: r => { this.data.set(r); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  onPageChange(e: PageEvent) { this.page = e.pageIndex + 1; this.pageSize = e.pageSize; this.load(); }
}