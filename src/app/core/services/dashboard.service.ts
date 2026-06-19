import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalClients: number;
  activeClients: number;
  totalSites: number;
  todayPresent: number;
  todayAbsent: number;
  todayOnLeave: number;
  pendingLeaveRequests: number;
  currentMonthPayroll: number;
  currentMonthRevenue: number;
  outstandingInvoices: number;
  attendanceTrend: AttendanceTrendItem[];
  revenueTrend: RevenueTrendItem[];
}

export interface AttendanceTrendItem {
  date: string;
  present: number;
  absent: number;
  onLeave: number;
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
  payrollCost: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats() {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`);
  }
}
