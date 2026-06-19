import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HighchartsChartModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.less',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly Highcharts = Highcharts;
  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly attendanceChartOptions = signal<Highcharts.Options>({});
  readonly revenueChartOptions = signal<Highcharts.Options>({});

  ngOnInit() {
    this.breadcrumbService.setItems([{ label: 'Dashboard' }]);

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.buildCharts(data);
        this.loading.set(false);
      },
      error: () => {
        const mockStats = this.getMockStats();
        this.stats.set(mockStats);
        this.buildCharts(mockStats);
        this.loading.set(false);
      },
    });
  }

  private buildCharts(data: DashboardStats) {
    this.attendanceChartOptions.set({
      chart: { type: 'area', backgroundColor: 'transparent', style: { fontFamily: 'Inter, sans-serif' }, height: 220 },
      title: { text: undefined },
      xAxis: {
        categories: data.attendanceTrend.map(d => d.date),
        labels: { style: { color: '#8b96a9', fontSize: '11px' } },
        gridLineWidth: 0,
        lineColor: '#e0e4ea',
      },
      yAxis: { title: { text: undefined }, gridLineColor: '#f0f2f5', labels: { style: { color: '#8b96a9' } } },
      series: [
        { type: 'area', name: 'Present', data: data.attendanceTrend.map(d => d.present), color: '#2e7d32', fillOpacity: 0.1 },
        { type: 'area', name: 'Absent', data: data.attendanceTrend.map(d => d.absent), color: '#c62828', fillOpacity: 0.1 },
        { type: 'area', name: 'On Leave', data: data.attendanceTrend.map(d => d.onLeave), color: '#0277bd', fillOpacity: 0.1 },
      ],
      legend: { itemStyle: { fontSize: '12px', color: '#5a6478' } },
      credits: { enabled: false },
      tooltip: { shared: true },
    });

    this.revenueChartOptions.set({
      chart: { type: 'column', backgroundColor: 'transparent', style: { fontFamily: 'Inter, sans-serif' }, height: 220 },
      title: { text: undefined },
      xAxis: {
        categories: data.revenueTrend.map(d => d.month),
        labels: { style: { color: '#8b96a9', fontSize: '11px' } },
        gridLineWidth: 0,
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: '#f0f2f5',
        labels: {
          style: { color: '#8b96a9' },
          formatter: function () {
            return '₹' + (Number(this.value) / 1000).toFixed(0) + 'K';
          },
        },
      },
      series: [
        { type: 'column', name: 'Revenue', data: data.revenueTrend.map(d => d.revenue), color: '#1565C0', borderRadius: 4 },
        { type: 'column', name: 'Payroll Cost', data: data.revenueTrend.map(d => d.payrollCost), color: '#e65100', borderRadius: 4 },
      ],
      credits: { enabled: false },
      tooltip: {
        shared: true,
        formatter: function () {
          let s = `<b>${this.x}</b><br>`;
          this.points?.forEach(p => {
            s += `${p.series.name}: ₹${Number(p.y).toLocaleString('en-IN')}<br>`;
          });
          return s;
        },
      },
      plotOptions: { column: { groupPadding: 0.1 } },
      legend: { itemStyle: { fontSize: '12px', color: '#5a6478' } },
    });
  }

  private getMockStats(): DashboardStats {
    return {
      totalEmployees: 248,
      activeEmployees: 231,
      totalClients: 18,
      activeClients: 15,
      totalSites: 32,
      todayPresent: 198,
      todayAbsent: 12,
      todayOnLeave: 21,
      pendingLeaveRequests: 7,
      currentMonthPayroll: 2450000,
      currentMonthRevenue: 4200000,
      outstandingInvoices: 850000,
      attendanceTrend: [
        { date: 'Mon', present: 220, absent: 15, onLeave: 13 },
        { date: 'Tue', present: 218, absent: 18, onLeave: 12 },
        { date: 'Wed', present: 225, absent: 10, onLeave: 13 },
        { date: 'Thu', present: 215, absent: 20, onLeave: 13 },
        { date: 'Fri', present: 222, absent: 14, onLeave: 12 },
        { date: 'Sat', present: 180, absent: 40, onLeave: 28 },
        { date: 'Today', present: 198, absent: 12, onLeave: 21 },
      ],
      revenueTrend: [
        { month: 'Jan', revenue: 3800000, payrollCost: 2100000 },
        { month: 'Feb', revenue: 3950000, payrollCost: 2200000 },
        { month: 'Mar', revenue: 4100000, payrollCost: 2300000 },
        { month: 'Apr', revenue: 3900000, payrollCost: 2250000 },
        { month: 'May', revenue: 4050000, payrollCost: 2350000 },
        { month: 'Jun', revenue: 4200000, payrollCost: 2450000 },
      ],
    };
  }

  formatCurrency(value: number): string {
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
    if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'K';
    return '₹' + value.toLocaleString('en-IN');
  }
}
