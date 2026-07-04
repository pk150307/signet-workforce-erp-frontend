import { Component, OnInit, inject, signal } from '@angular/core';
import { KeyValuePipe, } from '@angular/common';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InvoiceReportData } from '../../../core/models/reports.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
@Component({
  selector: 'app-invoice-report',
    templateUrl: './invoice-report.component.html',
  styleUrl: './invoice-report.component.less',
})
export class InvoiceReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);
  readonly loading = signal(true);
  readonly report = signal<InvoiceReportData | null>(null);

  ngOnInit() {
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