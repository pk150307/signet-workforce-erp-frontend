import { Injectable } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModuleFilterStore, ModulePeriodFilters } from './module-filter.store';
import { bindModulePeriodFilters } from '../utils/module-filter-bind.util';

export type BillingFilters = ModulePeriodFilters;

@Injectable({ providedIn: 'root' })
export class BillingFilterService {
  private readonly store = new ModuleFilterStore('billing');

  readonly filters = this.store.filters;
  readonly filterChanges = this.store.filterChanges;
  /** @deprecated use filterChanges */
  readonly clientIdChanges = this.filterChanges;

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

  patch(partial: Partial<BillingFilters>) {
    this.store.patch(partial);
  }

  resetClient() {
    this.setClientId(null);
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
