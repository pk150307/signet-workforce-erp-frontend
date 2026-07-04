import { Component, computed, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.less',
})
export class ApplyLeaveComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  private readonly leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave'];

  readonly leaveTypeOptions = computed(() =>
    this.leaveTypes.map(t => ({ key: t, value: t })),
  );

  readonly form = this.fb.group({
    leaveType: ['', Validators.required],
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    reason: ['', Validators.required],
  });

  get fromDateValue(): { startDate?: string } {
    const date = this.form.get('fromDate')?.value;
    return date ? { startDate: `${date}T00:00:00` } : {};
  }

  get toDateValue(): { startDate?: string } {
    const date = this.form.get('toDate')?.value;
    return date ? { startDate: `${date}T00:00:00` } : {};
  }

  onFromDateChange(value: { startDate?: string; endDate?: string }) {
    const datePart = value.startDate?.split('T')[0] ?? '';
    this.form.patchValue({ fromDate: datePart });
    this.form.get('fromDate')?.markAsTouched();
  }

  onToDateChange(value: { startDate?: string; endDate?: string }) {
    const datePart = value.startDate?.split('T')[0] ?? '';
    this.form.patchValue({ toDate: datePart });
    this.form.get('toDate')?.markAsTouched();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.notification.success('Leave request submitted successfully.');
    this.form.reset();
  }
}
