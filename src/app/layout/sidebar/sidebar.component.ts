import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { NAV_ITEMS, NavItem } from '../../core/constants/navigation.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatDividerModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.less',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() linkClicked = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = computed(() =>
    NAV_ITEMS.filter(item => this.canAccess(item))
  );

  isActive(route: string): boolean {
    if (!route) return false;

    const url = this.router.url.split('?')[0].split('#')[0];
    const routes = this.navItems()
      .map(item => item.route)
      .filter((r): r is string => !!r);

    const matchingRoute = routes
      .filter(r => url === r || url.startsWith(`${r}/`))
      .sort((a, b) => b.length - a.length)[0];

    return matchingRoute === route;
  }

  navigate(item: NavItem) {
    if (item.route) {
      this.router.navigate([item.route]);
      this.linkClicked.emit();
    }
  }

  private canAccess(item: NavItem): boolean {
    if (!item.permission) return true;
    const permissions = this.authService.userPermissions();
    const roles = this.authService.userRoles();
    // Show all menu items when user has no permissions assigned (dev/default access)
    if (permissions.length === 0 && roles.length === 0) return true;
    if (this.authService.hasRole('Admin') || this.authService.hasRole('admin')) return true;
    return this.authService.hasPermission(item.permission);
  }
}
