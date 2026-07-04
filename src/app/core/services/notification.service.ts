import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../shared/shared.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly sharedService = inject(SharedService);

  success(message: string, duration = 3500) {
    this.sharedService.showToastMessage(message, 'success', undefined, duration);
  }

  error(message: string, duration = 5000) {
    this.sharedService.showToastMessage(message, 'error', undefined, duration);
  }

  info(message: string, duration = 3500) {
    this.snackBar.open(message, '×', {
      duration,
      panelClass: ['snack--info'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  warning(message: string, duration = 4000) {
    this.sharedService.showToastMessage(message, 'quickError', undefined, duration);
  }
}
