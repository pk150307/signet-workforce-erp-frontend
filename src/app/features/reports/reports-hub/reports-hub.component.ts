import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-reports-hub',
    templateUrl: './reports-hub.component.html',
  styleUrl: './reports-hub.component.less',
})
export class ReportsHubComponent {
  readonly reports = [
    { icon: 'event_available', title: 'Attendance Report', description: 'Daily and monthly attendance summary', route: '/reports/attendance', color: '#2e7d32' },
    { icon: 'account_balance_wallet', title: 'Payroll Report', description: 'Payroll summary, deductions, and net pay', route: '/reports/payroll', color: '#512da8' },
    { icon: 'receipt_long', title: 'Invoice Report', description: 'Billing, collections, and outstanding', route: '/reports/invoices', color: '#e65100' },
    { icon: 'people', title: 'Employee Report', description: 'Headcount and department distribution', route: '/reports/employees', color: '#1565C0' }
  ];
}
