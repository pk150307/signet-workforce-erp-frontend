import { MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../shared/models/dialog.models';

export const APP_DIALOG_PANEL = 'app-dialog';
export const APP_CONFIRM_DIALOG_PANEL = 'app-confirm-dialog';
export const APP_DIALOG_OVERFLOW_VISIBLE = 'app-dialog--overflow-visible';

export function confirmDialogConfig(
  data: ConfirmDialogData,
  overrides: Partial<MatDialogConfig<ConfirmDialogData>> = {},
): MatDialogConfig<ConfirmDialogData> {
  return {
    panelClass: APP_CONFIRM_DIALOG_PANEL,
    autoFocus: 'dialog',
    width: '440px',
    maxWidth: '95vw',
    data,
    ...overrides,
  };
}

function mergePanelClass(
  base: string | string[],
  extra?: string | string[] | null,
): string | string[] {
  const baseList = Array.isArray(base) ? base : [base];
  if (!extra) return baseList.length === 1 ? baseList[0] : baseList;
  const extraList = Array.isArray(extra) ? extra : [extra];
  return [...baseList, ...extraList];
}

export function featureDialogConfig(
  overrides: Partial<MatDialogConfig> = {},
): MatDialogConfig {
  const { panelClass: overridePanelClass, ...rest } = overrides;
  return {
    autoFocus: 'dialog',
    width: '520px',
    maxWidth: '95vw',
    ...rest,
    panelClass: mergePanelClass(APP_DIALOG_PANEL, overridePanelClass),
  };
}

/** For dialogs that open select/date menus inside the panel. */
export function featureDropdownDialogConfig(
  overrides: Partial<MatDialogConfig> = {},
): MatDialogConfig {
  const { panelClass: overridePanelClass, ...rest } = overrides;
  return featureDialogConfig({
    width: '480px',
    maxWidth: '95vw',
    ...rest,
    panelClass: mergePanelClass(APP_DIALOG_OVERFLOW_VISIBLE, overridePanelClass),
  });
}
