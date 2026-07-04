import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BillingEngineService } from '../../../../core/services/billing-engine.service';
import { BillingEngineValidation } from '../../../../core/models/billing.models';
interface PrerequisiteItem {
  key: string;
  label: string;
  ok: boolean;
  required: boolean;
  route: string;
  action: string;
}

@Component({
  selector: 'app-billing-prerequisites',
  templateUrl: './billing-prerequisites.component.html',
  styleUrl: './billing-prerequisites.component.less',
})
export class BillingPrerequisitesComponent implements OnChanges {
  private readonly engine = inject(BillingEngineService);
  private readonly router = inject(Router);

  @Input({ required: true }) month!: number;
  @Input({ required: true }) year!: number;
  @Input() clientId: string | null = null;
  @Input() siteId: string | null = null;

  readonly items = signal<PrerequisiteItem[]>([]);

  ngOnChanges() {
    if (!this.clientId || !this.siteId) {
      this.items.set(this.staticItems(null));
      return;
    }
    this.engine.validate({
      month: this.month,
      year: this.year,
      clientId: this.clientId,
      siteId: this.siteId,
    }).subscribe({
      next: v => this.items.set(this.staticItems(v)),
      error: () => this.items.set(this.staticItems(null)),
    });
  }

  navigate(route: string) {
    void this.router.navigateByUrl(route);
  }

  private staticItems(validation: BillingEngineValidation | null): PrerequisiteItem[] {
    const checks = validation?.checks;
    return [
      {
        key: 'config',
        label: 'Billing configuration for site',
        ok: checks?.billingConfiguration ?? false,
        required: true,
        route: '/billing/configurations/new',
        action: 'Configure',
      },
      {
        key: 'attendance',
        label: 'Attendance register locked',
        ok: checks?.attendanceProcessed ?? false,
        required: true,
        route: '/attendance/register',
        action: 'Lock attendance',
      },
      {
        key: 'payroll',
        label: 'Payroll processed for period',
        ok: checks?.payrollProcessed ?? false,
        required: true,
        route: '/payroll',
        action: 'Process payroll',
      },
      {
        key: 'contract',
        label: 'Active contract for client/site',
        ok: checks?.contractActive ?? false,
        required: false,
        route: '/billing/contracts/new',
        action: 'Add contract',
      },
    ];
  }
}
