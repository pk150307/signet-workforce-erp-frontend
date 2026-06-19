import { Component, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../core/services/notification.service';
@Component({ selector: 'app-apply-leave', standalone: true,
  imports: [NgFor, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './apply-leave.component.html', styleUrl: './apply-leave.component.less' })
export class ApplyLeaveComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  readonly form = this.fb.group({ leaveType: ['', Validators.required], fromDate: [null as Date | null, Validators.required], toDate: [null as Date | null, Validators.required], reason: ['', Validators.required] });
  readonly leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave'];
  ngOnInit() { this.breadcrumbService.setItems([{ label: 'Leave', route: '/leave' }, { label: 'Apply Leave' }]); }
  submit() { if (this.form.invalid) return; this.notification.success('Leave request submitted successfully.'); this.form.reset(); }
}