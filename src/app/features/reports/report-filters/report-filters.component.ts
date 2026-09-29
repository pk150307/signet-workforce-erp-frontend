import { Component, DestroyRef, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime, merge } from 'rxjs';
import { ClientsService } from '../../../core/services/clients.service';
import { ClientListItem } from '../../../core/models/client.models';
import { ReportQuery } from '../../../core/models/reports.models';
import { portalYearSelectOptions } from '../../../core/utils/year-options.util';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-report-filters',
  templateUrl: './report-filters.component.html',
  styleUrl: './report-filters.component.less',
})
export class ReportFiltersComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() filtersChange = new EventEmitter<ReportQuery>();

  readonly clients = signal<ClientListItem[]>([]);
  readonly monthCtrl = new FormControl<string>('');
  readonly yearCtrl = new FormControl<string>('');
  readonly clientCtrl = new FormControl<string>('');

  readonly monthOptions = [
    { key: '', value: 'All months' },
    ...MONTH_LABELS.map((label, index) => ({ key: String(index + 1), value: label })),
  ];

  readonly yearOptions = [
    { key: '', value: 'All years' },
    ...portalYearSelectOptions(),
  ];

  readonly clientOptions = computed(() => [
    { key: '', value: 'All clients' },
    ...this.clients().map((client) => ({ key: String(client.id), value: client.companyName })),
  ]);

  readonly query = signal<ReportQuery>({});
  readonly hasFilters = computed(() =>
    Boolean(this.query().month || this.query().year || this.query().clientId),
  );

  ngOnInit(): void {
    this.clientsService.getAllForSelect().subscribe({
      next: (list) => this.clients.set(list),
      error: () => this.clients.set([]),
    });

    this.emitFilters();
    merge(this.monthCtrl.valueChanges, this.yearCtrl.valueChanges, this.clientCtrl.valueChanges)
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());
  }

  clearFilters(): void {
    this.monthCtrl.setValue('');
    this.yearCtrl.setValue('');
    this.clientCtrl.setValue('');
  }

  private emitFilters(): void {
    const month = Number(this.monthCtrl.value);
    const year = Number(this.yearCtrl.value);
    const next: ReportQuery = {
      month: Number.isFinite(month) && month >= 1 ? month : null,
      year: Number.isFinite(year) && year >= 2000 ? year : null,
      clientId: this.clientCtrl.value || null,
    };
    this.query.set(next);
    this.filtersChange.emit(next);
  }
}
