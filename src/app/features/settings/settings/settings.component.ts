import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { SETTINGS_NAV_ITEMS, SettingsNavItem } from '../shared/settings-nav.config';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.less',
})
export class SettingsComponent implements OnInit {
  private readonly authService = inject(AuthService);

  cards: SettingsNavItem[] = [];

  ngOnInit(): void {
    const can = (perm: string) =>
      this.authService.hasPermission(perm) || this.authService.hasRole('Super Admin');

    this.cards = SETTINGS_NAV_ITEMS
      .filter(item => item.path !== '/settings' && item.visible(can));
  }
}
