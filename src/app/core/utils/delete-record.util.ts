import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { DeleteActionResult } from '../models/delete-action.models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DeleteReasonDialogComponent } from '../../shared/components/delete-reason-dialog/delete-reason-dialog.component';
import { confirmDialogConfig, featureDialogConfig } from './dialog.util';

export function requiresDeleteApproval(auth: AuthService): boolean {
  return auth.hasRole('HR Manager') && !auth.hasRole('Super Admin');
}

export function runDeleteWithApproval(options: {
  auth: AuthService;
  dialog: MatDialog;
  notification: NotificationService;
  title: string;
  entityLabel: string;
  deleteFn: (reason?: string) => Observable<DeleteActionResult>;
  onSuccess: () => void;
}): void {
  options.dialog
    .open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: options.title,
        message: `Delete "${options.entityLabel}"?`,
        confirmLabel: requiresDeleteApproval(options.auth) ? 'Continue' : 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    )
    .afterClosed()
    .subscribe((confirmed) => {
      if (!confirmed) return;

      const proceed = (reason?: string) => {
        options.deleteFn(reason).subscribe({
          next: (result) => {
            if (result.action === 'pending_approval') {
              options.notification.success(
                result.message ?? 'Delete request submitted for Super Admin approval.',
              );
            } else {
              options.notification.success('Record deleted successfully.');
            }
            options.onSuccess();
          },
          error: (err) => {
            options.notification.error(err?.error?.message ?? 'Delete failed.');
          },
        });
      };

      if (!requiresDeleteApproval(options.auth)) {
        proceed();
        return;
      }

      options.dialog
        .open(DeleteReasonDialogComponent, {
          ...featureDialogConfig({ width: '480px' }),
          data: {
            title: options.title,
            entityLabel: options.entityLabel,
          },
        })
        .afterClosed()
        .subscribe((reason) => {
          if (!reason) return;
          proceed(reason);
        });
    });
}
