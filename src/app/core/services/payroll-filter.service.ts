import { Injectable } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { ModuleFilterStore, ModulePeriodFilters } from './module-filter.store';
import { bindModulePeriodFilters } from '../utils/module-filter-bind.util';
import { FormControl } from '@angular/forms';

export type PayrollFilters = ModulePeriodFilters;

@Injectable({ providedIn: 'root' })
export class PayrollFilterService {
  private readonly store = new ModuleFilterStore('payroll');

  readonly filters = this.store.filters;
  readonly filterChanges = this.store.filterChanges;

  clientId = () => this.store.clientId();
  month = () => this.store.month();
  year = () => this.store.year();
  clientIdOrUndefined = () => this.store.clientIdOrUndefined();

  setClientId(clientId: string | null) {
    this.store.setClientId(clientId);
  }

  setPeriod(month: number, year: number) {
    this.store.setPeriod(month, year);
  }

  patch(partial: Partial<PayrollFilters>) {
    this.store.patch(partial);
  }

  resetAll() {
    this.store.resetAll();
  }

  bindControls(
    controls: {
      month: FormControl<number | null>;
      year: FormControl<number | null>;
      clientId?: FormControl<string | null>;
    },
    destroyRef: DestroyRef,
    onExternalChange?: () => void,
  ) {
    bindModulePeriodFilters(this.store, controls, { destroyRef, onExternalChange });
  }
}
