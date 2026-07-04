import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedService } from '../../../shared/shared.service';
import { ToastData } from '../../../shared/models/toastData.interface';

@Component({
  selector: 'signet-toast-notification',
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.less'
})
export class ToastNotificationComponent implements OnInit {
  message: string | null = "message";
  helptext:string | undefined='';
  variant: "success" | "error" | "quickError" = "success";
  iconUrl = "/assets/images/icons/user-access/success.png";
  visible = false;
  timeoutId: any;
  private destroy$ = new Subject<void>();
  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.toastState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ToastData) => {
        this.message = data.message;
        this.variant = data.variant;
        this.helptext = data.helptext
        this.iconUrl =
          this.variant === "success"
            ? "/assets/images/icons/user-access/success.png"
            : "/assets/images/icons/user-access/error-warning-fill1.png";
        this.visible = true;

        clearTimeout(this.timeoutId);
        const duration =
          data.durationMs ??
          (this.variant === 'quickError' ? 2500 : 6000);
        this.timeoutId = setTimeout(() => this.close(), duration);
      });
  }

  close() {
    this.visible = false;
  }
  ngOnDestroy() {
    this.destroy$.next(); // Notify observers to unsubscribe
    this.destroy$.complete(); // Close the subject itself
  }
}