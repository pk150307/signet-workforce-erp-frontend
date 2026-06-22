import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveSummary } from '../../../core/models/leave.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({ selector: 'app-leave-dashboard', standalone: true, imports: [NgIf, NgFor, RouterLink, MatButtonModule, MatIconModule, SkeletonLoaderComponent], templateUrl: './leave-dashboard.component.html', styleUrl: './leave-dashboard.component.less' })
export class LeaveDashboardComponent implements OnInit {
  private readonly leaveService = inject(LeaveService);
  readonly loading = signal(true);
  readonly summary = signal<LeaveSummary | null>(null);
  readonly links = [
    { route: '/leave/apply', icon: 'add_circle', label: 'Apply Leave' },
    { route: '/leave/approval', icon: 'approval', label: 'Approvals' },
    { route: '/leave/balance', icon: 'account_balance', label: 'Leave Balance' },
    { route: '/leave/types', icon: 'category', label: 'Leave Types' },
    { route: '/leave/calendar', icon: 'calendar_month', label: 'Calendar' },
  ];
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.leaveService.getSummary().subscribe({ next: s => { this.summary.set(s); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}