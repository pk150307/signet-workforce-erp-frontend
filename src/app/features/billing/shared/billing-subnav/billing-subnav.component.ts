import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientsService } from '../../../../core/services/clients.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { ClientListItem } from '../../../../core/models/client.models';
interface BillingNavLink {
  label: string;
  path: string;
  exact: boolean;
}

@Component({
  selector: 'app-billing-subnav',
  templateUrl: './billing-subnav.component.html',
  styleUrl: './billing-subnav.component.less',
})
export class BillingSubnavComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly clients = signal<ClientListItem[]>([]);
  readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }),
  }));
  readonly years = [2024, 2025, 2026, 2027];

  readonly clientOptions = computed(() => [
    { key: '', value: 'All clients' },
    ...this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  ]);

  readonly monthOptions = computed(() =>
    this.months.map(m => ({ key: String(m.value), value: m.label })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

  readonly navLinks: BillingNavLink[] = [
    { label: 'Dashboard', path: '/billing/dashboard', exact: true },
    { label: 'Invoices', path: '/billing/invoices', exact: false },
    { label: 'Configuration', path: '/billing/configurations', exact: false },
    { label: 'Contracts', path: '/billing/contracts', exact: false },
    { label: 'Reports', path: '/billing/reports', exact: true },
  ];

  readonly navigationItems = this.navLinks.map(link => ({
    label: link.label,
    value: link.path,
  }));

  readonly selectedNavPath = signal(this.resolveActivePath(this.router.url));

  readonly filterForm = new FormGroup({
    clientId: new FormControl<string | null>(this.billingFilter.clientId()),
    month: new FormControl(this.billingFilter.month(), { nonNullable: true }),
    year: new FormControl(this.billingFilter.year(), { nonNullable: true }),
  });

  ngOnInit() {
    this.selectedNavPath.set(this.resolveActivePath(this.router.url));

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(event => {
      this.selectedNavPath.set(this.resolveActivePath(event.urlAfterRedirects));
    });

    this.billingFilter.bindControls({
      clientId: this.filterForm.controls.clientId,
      month: this.filterForm.controls.month,
      year: this.filterForm.controls.year,
    }, this.destroyRef);

    this.clientsService.getAllForSelect().subscribe({
      next: clients => {
        this.clients.set(clients);
        // Re-apply stored filter so the dropdown does not auto-select the first client.
        this.filterForm.controls.clientId.setValue(this.billingFilter.clientId() ?? '', { emitEvent: false });
      },
    });
  }

  onNavSelect(path: string): void {
    if (path === this.selectedNavPath()) return;
    void this.router.navigateByUrl(path);
  }

  private resolveActivePath(url: string): string {
    const path = url.split('?')[0];

    const exactMatch = this.navLinks.find(link => link.exact && path === link.path);
    if (exactMatch) return exactMatch.path;

    const prefixMatch = this.navLinks
      .filter(link => !link.exact)
      .filter(link => path === link.path || path.startsWith(`${link.path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0];

    return prefixMatch?.path ?? this.navLinks[0].path;
  }

  hasActiveFilters(): boolean {
    const f = this.billingFilter.filters();
    const now = new Date();
    return Boolean(f.clientId) || f.month !== now.getMonth() + 1 || f.year !== now.getFullYear();
  }

  resetFilters() {
    this.billingFilter.resetAll();
    this.filterForm.setValue({
      clientId: null,
      month: this.billingFilter.month(),
      year: this.billingFilter.year(),
    }, { emitEvent: false });
  }
}
