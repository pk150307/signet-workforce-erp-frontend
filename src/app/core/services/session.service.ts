import { Injectable, inject, NgZone, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './auth.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from '../../shared/models/dialog.models';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000; // 2 minutes before logout

@Injectable({ providedIn: 'root' })
export class SessionService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly ngZone = inject(NgZone);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private warningId: ReturnType<typeof setTimeout> | null = null;
  private warningOpen = false;

  init() {
    this.resetTimer();
    this.ngZone.runOutsideAngular(() => {
      ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => this.onActivity(), { passive: true });
      });
    });
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private onActivity() {
    if (this.authService.isAuthenticated()) {
      this.resetTimer();
    }
  }

  private resetTimer() {
    this.clearTimers();

    if (!this.authService.isAuthenticated()) return;

    this.warningId = setTimeout(() => this.showWarning(), SESSION_TIMEOUT_MS - WARNING_BEFORE_MS);
    this.timeoutId = setTimeout(() => this.logout(), SESSION_TIMEOUT_MS);
  }

  private showWarning() {
    if (this.warningOpen || !this.authService.isAuthenticated()) return;
    this.warningOpen = true;

    this.ngZone.run(() => {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Session Expiring',
          message: 'Your session will expire in 2 minutes due to inactivity. Stay signed in?',
          confirmLabel: 'Stay Signed In',
          cancelLabel: 'Sign Out',
          confirmColor: 'primary',
        } satisfies ConfirmDialogData,
      });

      ref.afterClosed().subscribe(stay => {
        this.warningOpen = false;
        if (stay) {
          this.resetTimer();
        } else {
          this.authService.logout();
        }
      });
    });
  }

  private logout() {
    this.ngZone.run(() => {
      if (this.authService.isAuthenticated()) {
        this.authService.logout();
      }
    });
  }

  private clearTimers() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);
    this.timeoutId = null;
    this.warningId = null;
  }
}
