import { signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModulePeriodFilters {
  clientId: string | null;
  month: number;
  year: number;
}

function defaultFilters(): ModulePeriodFilters {
  const now = new Date();
  return {
    clientId: null,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function normalizeFilters(raw: Partial<ModulePeriodFilters> | null | undefined): ModulePeriodFilters {
  const defaults = defaultFilters();
  if (!raw) return defaults;

  const month = Number(raw.month);
  const year = Number(raw.year);

  return {
    clientId: raw.clientId ?? null,
    month: month >= 1 && month <= 12 ? month : defaults.month,
    year: year >= 2000 && year <= 2100 ? year : defaults.year,
  };
}

function filtersEqual(a: ModulePeriodFilters, b: ModulePeriodFilters): boolean {
  return a.clientId === b.clientId && a.month === b.month && a.year === b.year;
}

/** Session-scoped client / month / year filters isolated per ERP module. */
export class ModuleFilterStore {
  private readonly storageKey: string;
  private readonly filtersSignal = signal<ModulePeriodFilters>(this.load());
  private readonly changes$ = new Subject<ModulePeriodFilters>();

  readonly filters = this.filtersSignal.asReadonly();
  readonly filterChanges = this.changes$.asObservable();

  constructor(moduleKey: string) {
    this.storageKey = `signet:filters:${moduleKey}`;
  }

  clientId = () => this.filtersSignal().clientId;
  month = () => this.filtersSignal().month;
  year = () => this.filtersSignal().year;
  clientIdOrUndefined = () => this.filtersSignal().clientId ?? undefined;

  setClientId(clientId: string | null) {
    this.patch({ clientId });
  }

  setPeriod(month: number, year: number) {
    this.patch({ month, year });
  }

  patch(partial: Partial<ModulePeriodFilters>) {
    const next = normalizeFilters({ ...this.filtersSignal(), ...partial });
    if (filtersEqual(next, this.filtersSignal())) return;
    this.filtersSignal.set(next);
    this.persist(next);
    this.changes$.next(next);
  }

  resetAll() {
    const next = defaultFilters();
    this.filtersSignal.set(next);
    sessionStorage.removeItem(this.storageKey);
    this.changes$.next(next);
  }

  private load(): ModulePeriodFilters {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (raw) return normalizeFilters(JSON.parse(raw) as Partial<ModulePeriodFilters>);
    } catch {
      // ignore corrupt storage
    }
    return defaultFilters();
  }

  private persist(filters: ModulePeriodFilters) {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(filters));
    } catch {
      // ignore quota / private mode
    }
  }
}
