import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { merge } from 'rxjs';
import { ModuleFilterStore } from '../services/module-filter.store';

interface PeriodFilterControls {
  month: FormControl<number | null>;
  year: FormControl<number | null>;
  clientId?: FormControl<string | null | string>;
}

function clientIdFromControl(value: string | null | undefined): string | null {
  return value ? String(value) : null;
}

/**
 * Two-way sync between form controls and a module filter store.
 * Filters persist for the browser session and do not reset on navigation.
 */
export function bindModulePeriodFilters(
  store: ModuleFilterStore,
  controls: PeriodFilterControls,
  options: {
    destroyRef: DestroyRef;
    onExternalChange?: () => void;
    requireClient?: boolean;
  },
): void {
  let syncing = false;

  const applyStoreToControls = () => {
    const f = store.filters();
    syncing = true;
    controls.month.setValue(f.month, { emitEvent: false });
    controls.year.setValue(f.year, { emitEvent: false });
    if (controls.clientId) {
      controls.clientId.setValue(f.clientId ?? '', { emitEvent: false });
    }
    syncing = false;
  };

  applyStoreToControls();

  const controlStreams: Array<typeof controls.month.valueChanges> = [
    controls.month.valueChanges,
    controls.year.valueChanges,
  ];
  if (controls.clientId) controlStreams.push(controls.clientId.valueChanges as typeof controls.month.valueChanges);

  merge(...controlStreams).pipe(takeUntilDestroyed(options.destroyRef)).subscribe(() => {
    if (syncing) return;
    const month = controls.month.value;
    const year = controls.year.value;
    if (month == null || year == null) return;

    store.patch({
      month,
      year,
      clientId: clientIdFromControl(controls.clientId?.value as string | null),
    });
  });

  store.filterChanges.pipe(takeUntilDestroyed(options.destroyRef)).subscribe(() => {
    applyStoreToControls();
    options.onExternalChange?.();
  });
}
