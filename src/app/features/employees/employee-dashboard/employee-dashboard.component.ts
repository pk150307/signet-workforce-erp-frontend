import { Component, OnInit, inject, signal } from '@angular/core';
import { SafeDatePipe } from '../../../shared/pipes/safe-date.pipe';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { EmployeeService } from '../../../core/services/employee.service';
import {
  EmployeeActivity,
  EmployeeActivityType,
  EmployeeDashboardStats,
  EmployeeListItem,
} from '../../../core/models/employee.models';
import { EmployeeCardComponent } from '../components/employee-card/employee-card.component';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    SafeDatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HighchartsChartModule,
    EmployeeCardComponent,
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.less',
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  readonly Highcharts = Highcharts;
  readonly loading = signal(true);
  readonly apiUnavailable = signal(false);
  readonly stats = signal<EmployeeDashboardStats | null>(null);
  readonly recentEmployees = signal<EmployeeListItem[]>([]);
  readonly recentActivities = signal<EmployeeActivity[]>([]);
  readonly departmentChartOptions = signal<Highcharts.Options>({});
  readonly headcountChartOptions = signal<Highcharts.Options>({});

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);

    forkJoin({
      stats: this.employeeService.getDashboardStats().pipe(catchError(() => of(this.getMockStats()))),
      recent: this.employeeService.getRecentEmployees(5).pipe(catchError(() => of(this.getMockRecentEmployees()))),
      activities: this.employeeService.getRecentActivities(8).pipe(catchError(() => of(this.getMockActivities()))),
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: ({ stats, recent, activities }) => {
        this.stats.set(stats);
        this.recentEmployees.set(recent);
        this.recentActivities.set(activities);
        this.buildCharts(stats);
      },
      error: () => {
        this.apiUnavailable.set(true);
        const mockStats = this.getMockStats();
        this.stats.set(mockStats);
        this.recentEmployees.set(this.getMockRecentEmployees());
        this.recentActivities.set(this.getMockActivities());
        this.buildCharts(mockStats);
      },
    });
  }

  viewEmployee(id: string) {
    this.router.navigate(['/employees', id]);
  }

  getActivityIcon(type: EmployeeActivityType): string {
    const icons: Record<EmployeeActivityType, string> = {
      created: 'person_add',
      updated: 'edit',
      marked_left: 'logout',
      rejoined: 'login',
      document_uploaded: 'upload_file',
      draft_saved: 'draft',
    };
    return icons[type] ?? 'history';
  }

  getActivityIconClass(type: EmployeeActivityType): string {
    const classes: Record<EmployeeActivityType, string> = {
      created: 'green',
      updated: 'blue',
      marked_left: 'red',
      rejoined: 'teal',
      document_uploaded: 'purple',
      draft_saved: 'orange',
    };
    return classes[type] ?? 'blue';
  }

  private buildCharts(data: EmployeeDashboardStats) {
    this.departmentChartOptions.set({
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' },
        height: 260,
      },
      title: { text: undefined },
      plotOptions: {
        pie: {
          innerSize: '55%',
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y}',
            style: { fontSize: '11px', color: '#5a6478', fontWeight: '500' },
          },
        },
      },
      series: [{
        type: 'pie',
        name: 'Employees',
        data: data.departmentDistribution.map(d => ({ name: d.department, y: d.count })),
        colors: ['#1565C0', '#2E7D32', '#E65100', '#512DA8', '#00796B', '#C62828', '#0277BD'],
      }],
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.y}</b> employees ({point.percentage:.1f}%)' },
    });

    this.headcountChartOptions.set({
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' },
        height: 260,
      },
      title: { text: undefined },
      xAxis: {
        categories: data.headcountTrend.map(d => d.month),
        labels: { style: { color: '#8b96a9', fontSize: '11px' } },
        gridLineWidth: 0,
        lineColor: '#e0e4ea',
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: '#f0f2f5',
        labels: { style: { color: '#8b96a9' } },
        allowDecimals: false,
      },
      series: [
        {
          type: 'column',
          name: 'New Joiners',
          data: data.headcountTrend.map(d => d.joiners),
          color: '#2E7D32',
          borderRadius: 4,
        },
        {
          type: 'column',
          name: 'Exits',
          data: data.headcountTrend.map(d => d.exits),
          color: '#C62828',
          borderRadius: 4,
        },
      ],
      legend: { itemStyle: { fontSize: '12px', color: '#5a6478' } },
      credits: { enabled: false },
      tooltip: { shared: true },
      plotOptions: { column: { groupPadding: 0.15 } },
    });
  }

  private getMockStats(): EmployeeDashboardStats {
    return {
      totalEmployees: 248,
      activeEmployees: 215,
      leftEmployees: 28,
      draftEmployees: 5,
      newJoinersThisMonth: 12,
      exitsThisMonth: 4,
      departmentDistribution: [
        { department: 'Operations', count: 82 },
        { department: 'Security', count: 64 },
        { department: 'Housekeeping', count: 48 },
        { department: 'Administration', count: 32 },
        { department: 'Finance', count: 22 },
      ],
      headcountTrend: [
        { month: 'Jan', joiners: 8, exits: 3 },
        { month: 'Feb', joiners: 10, exits: 2 },
        { month: 'Mar', joiners: 14, exits: 5 },
        { month: 'Apr', joiners: 9, exits: 4 },
        { month: 'May', joiners: 11, exits: 6 },
        { month: 'Jun', joiners: 12, exits: 4 },
      ],
    };
  }

  private getMockRecentEmployees(): EmployeeListItem[] {
    return [
      {
        id: '1',
        employeeCode: 'EMP-0248',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@signet.com',
        phone: '9876543210',
        department: 'Operations',
        designation: 'Site Supervisor',
        siteName: 'Tech Park Alpha',
        status: 1,
        joiningDate: '2026-06-10',
        profilePhotoUrl: null,
      },
      {
        id: '2',
        employeeCode: 'EMP-0247',
        fullName: 'Rajesh Kumar',
        email: 'rajesh.kumar@signet.com',
        phone: '9876543211',
        department: 'Security',
        designation: 'Security Guard',
        siteName: 'Mall Central',
        status: 1,
        joiningDate: '2026-06-08',
        profilePhotoUrl: null,
      },
      {
        id: '3',
        employeeCode: 'EMP-0246',
        fullName: 'Anita Desai',
        email: 'anita.desai@signet.com',
        phone: '9876543212',
        department: 'Housekeeping',
        designation: 'Team Lead',
        siteName: 'Corporate Tower B',
        status: 0,
        joiningDate: '2026-06-05',
        profilePhotoUrl: null,
      },
      {
        id: '4',
        employeeCode: 'EMP-0245',
        fullName: 'Mohammed Ali',
        email: 'mohammed.ali@signet.com',
        phone: '9876543213',
        department: 'Operations',
        designation: 'Field Executive',
        siteName: 'Industrial Zone',
        status: 3,
        joiningDate: '2026-06-01',
        profilePhotoUrl: null,
      },
      {
        id: '5',
        employeeCode: 'EMP-0244',
        fullName: 'Sunita Patel',
        email: 'sunita.patel@signet.com',
        phone: '9876543214',
        department: 'Administration',
        designation: 'HR Coordinator',
        siteName: 'Head Office',
        status: 1,
        joiningDate: '2026-05-28',
        profilePhotoUrl: null,
      },
    ];
  }

  private getMockActivities(): EmployeeActivity[] {
    return [
      {
        id: 'a1',
        employeeId: '1',
        employeeName: 'Priya Sharma',
        employeeCode: 'EMP-0248',
        type: 'created',
        description: 'New employee onboarded',
        performedBy: 'HR Admin',
        performedAt: '2026-06-10T10:30:00Z',
      },
      {
        id: 'a2',
        employeeId: '4',
        employeeName: 'Mohammed Ali',
        employeeCode: 'EMP-0245',
        type: 'rejoined',
        description: 'Employee reactivated after previous exit',
        performedBy: 'HR Manager',
        performedAt: '2026-06-01T14:15:00Z',
      },
      {
        id: 'a3',
        employeeId: '3',
        employeeName: 'Anita Desai',
        employeeCode: 'EMP-0246',
        type: 'draft_saved',
        description: 'Employee draft saved — pending statutory details',
        performedBy: 'HR Admin',
        performedAt: '2026-06-05T09:00:00Z',
      },
      {
        id: 'a4',
        employeeId: '6',
        employeeName: 'Vikram Singh',
        employeeCode: 'EMP-0201',
        type: 'marked_left',
        description: 'Employee marked as left — resignation accepted',
        performedBy: 'HR Manager',
        performedAt: '2026-05-30T16:45:00Z',
      },
      {
        id: 'a5',
        employeeId: '2',
        employeeName: 'Rajesh Kumar',
        employeeCode: 'EMP-0247',
        type: 'document_uploaded',
        description: 'Aadhaar document uploaded',
        performedBy: 'HR Admin',
        performedAt: '2026-06-08T11:20:00Z',
      },
    ];
  }
}
