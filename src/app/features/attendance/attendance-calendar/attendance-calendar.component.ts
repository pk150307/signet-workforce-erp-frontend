import { Component, OnInit, inject } from '@angular/core';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-attendance-calendar',
  templateUrl: './attendance-calendar.component.html',
  styleUrl: './attendance-calendar.component.less',
})
export class AttendanceCalendarComponent implements OnInit {
  private readonly breadcrumbService = inject(BreadcrumbService);

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Attendance', route: '/attendance' },
      { label: 'Calendar' },
    ]);
  }
}
