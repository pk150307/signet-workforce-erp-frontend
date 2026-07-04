import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { LoginHistoryService, LoginHistoryItem } from '../../../core/services/login-history.service';
@Component({
  selector: 'app-profile',
    templateUrl: './profile.component.html',
  styleUrl: './profile.component.less',
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly loginHistoryService = inject(LoginHistoryService);
  readonly router = inject(Router);

  readonly loginHistory = signal<LoginHistoryItem[]>([]);
  readonly loadingHistory = signal(true);

  ngOnInit(): void {
    this.loginHistoryService.myHistory({ pageSize: 5 }).subscribe({
      next: (result) => {
        this.loginHistory.set(result.items);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }
}
