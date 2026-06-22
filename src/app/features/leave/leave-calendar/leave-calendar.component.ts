import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-leave-calendar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './leave-calendar.component.html',
  styleUrl: './leave-calendar.component.less',
})
export class LeaveCalendarComponent {}
