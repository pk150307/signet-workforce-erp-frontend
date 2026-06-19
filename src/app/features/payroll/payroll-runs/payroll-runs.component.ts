import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-payroll-runs',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './payroll-runs.component.html',
  styleUrl: './payroll-runs.component.less',
})
export class PayrollRunsComponent implements OnInit {
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly loading = signal(false);
  readonly currentMonthPayroll = signal(2450000);
  readonly pendingApproval = signal(3);

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Home', route: '/dashboard' },
      { label: 'Payroll' },
    ]);
  }

  formatCurrency(value: number): string {
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
    return '₹' + value.toLocaleString('en-IN');
  }
}
