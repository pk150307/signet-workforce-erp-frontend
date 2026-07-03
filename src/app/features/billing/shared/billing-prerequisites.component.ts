import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BillingEngineService } from '../../../core/services/billing-engine.service';
import { BillingEngineValidation } from '../../../core/models/billing.models';

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
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="prereq-card" *ngIf="items().length">
      <h4>Billing prerequisites</h4>
      <p class="hint">Complete these steps for the selected period before generating an invoice.</p>
      <ul>
        <li *ngFor="let item of items()" [ngClass]="{ ok: item.ok, warn: !item.ok && !item.required, error: !item.ok && item.required }">
          <mat-icon>{{ item.ok ? 'check_circle' : (item.required ? 'error' : 'info') }}</mat-icon>
          <span>{{ item.label }}</span>
          <a mat-stroked-button *ngIf="!item.ok" [routerLink]="item.route">{{ item.action }}</a>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .prereq-card {
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 16px;
      background: var(--color-bg);
    }
    h4 { margin: 0 0 4px; font-size: 14px; }
    .hint { margin: 0 0 12px; font-size: 12px; color: var(--color-text-secondary); }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      flex-wrap: wrap;
    }
    li mat-icon { font-size: 18px; width: 18px; height: 18px; }
    li.ok mat-icon { color: #2e7d32; }
    li.error mat-icon { color: #c62828; }
    li.warn mat-icon { color: #e65100; }
    li a { margin-left: auto; }
  `],
})
export class BillingPrerequisitesComponent implements OnChanges {
  private readonly engine = inject(BillingEngineService);

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
