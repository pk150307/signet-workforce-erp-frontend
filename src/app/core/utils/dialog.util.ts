import { MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../shared/models/dialog.models';

export const APP_DIALOG_PANEL = 'app-dialog';
export const APP_CONFIRM_DIALOG_PANEL = 'app-confirm-dialog';

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

export function featureDialogConfig(
  overrides: Partial<MatDialogConfig> = {},
): MatDialogConfig {
  return {
    panelClass: APP_DIALOG_PANEL,
    autoFocus: 'dialog',
    width: '520px',
    maxWidth: '95vw',
    ...overrides,
  };
}
