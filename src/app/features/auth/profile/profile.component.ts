import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { LoginHistoryService, LoginHistoryItem } from '../../../core/services/login-history.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.less',
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly loginHistoryService = inject(LoginHistoryService);

  readonly loginHistory = signal<LoginHistoryItem[]>([]);
  readonly loadingHistory = signal(true);

  ngOnInit(): void {
    this.loginHistoryService.myHistory({ page: 1, pageSize: 5 }).subscribe({
      next: (result) => {
        this.loginHistory.set(result.items);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }
}
