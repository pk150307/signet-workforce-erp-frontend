import { Component, OnInit, inject, signal } from '@angular/core';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReportsService } from '../../../core/services/reports.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InvoiceReportData } from '../../../core/models/reports.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-invoice-report',
  standalone: true,
  imports: [NgIf, NgFor, KeyValuePipe, MatButtonModule, MatIconModule, SkeletonLoaderComponent, EmptyStateComponent],
  templateUrl: './invoice-report.component.html',
  styleUrl: './invoice-report.component.less',
})
export class InvoiceReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  readonly loading = signal(true);
  readonly report = signal<InvoiceReportData | null>(null);

  ngOnInit() {
    this.breadcrumbService.setItems([{ label: 'Reports', route: '/reports' }, { label: 'Invoices' }]);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.reportsService.getInvoiceReport().subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notification.info('Showing sample report data.'); },
    });
  }
}