import { Component, OnInit, Output, EventEmitter, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { InboxNotificationsService } from '../../core/services/inbox-notifications.service';
import { InboxNotificationItem } from '../../core/models/iam.models';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.less',
})
export class TopbarComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly inboxService = inject(InboxNotificationsService);
  private readonly router = inject(Router);

  readonly unreadCount = signal(0);
  readonly notifications = signal<InboxNotificationItem[]>([]);
  readonly loadingNotifications = signal(false);

  ngOnInit(): void {
    this.refreshNotifications();
  }

  refreshNotifications(): void {
    this.inboxService.summary().subscribe({
      next: (summary) => this.unreadCount.set(summary.unreadCount),
      error: () => this.unreadCount.set(0),
    });
  }

  onNotificationsMenuOpened(): void {
    this.loadingNotifications.set(true);
    this.inboxService.list({ page: 1, pageSize: 10, unreadOnly: false }).subscribe({
      next: (result) => {
        this.notifications.set(result.items);
        this.loadingNotifications.set(false);
      },
      error: () => {
        this.notifications.set([]);
        this.loadingNotifications.set(false);
      },
    });
  }

  openNotification(item: InboxNotificationItem): void {
    if (!item.isRead) {
      this.inboxService.markRead(item.id).subscribe({
        next: () => this.refreshNotifications(),
      });
    }
    if (item.link) {
      void this.router.navigateByUrl(item.link);
    }
  }

  markAllRead(): void {
    this.inboxService.markAllRead().subscribe({
      next: () => {
        this.unreadCount.set(0);
        this.notifications.update((items) => items.map((n) => ({ ...n, isRead: true })));
      },
    });
  }
}
