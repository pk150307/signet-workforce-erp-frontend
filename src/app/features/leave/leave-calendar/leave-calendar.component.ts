import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
@Component({ selector: 'app-leave-calendar', standalone: true, imports: [MatIconModule], templateUrl: './leave-calendar.component.html', styleUrl: './leave-calendar.component.less' })
export class LeaveCalendarComponent implements OnInit {
  private readonly breadcrumbService = inject(BreadcrumbService);
  ngOnInit() { this.breadcrumbService.setItems([{ label: 'Leave', route: '/leave' }, { label: 'Calendar' }]); }
}