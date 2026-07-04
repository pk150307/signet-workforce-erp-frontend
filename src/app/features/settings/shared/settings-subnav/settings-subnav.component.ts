import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { SETTINGS_NAV_ITEMS } from '../settings-nav.config';

@Component({
  selector: 'app-settings-subnav',
  templateUrl: './settings-subnav.component.html',
  styleUrl: './settings-subnav.component.less',
})
export class SettingsSubnavComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly navigationItems = signal<{ label: string; value: string }[]>([]);
  readonly selectedNavPath = signal('/settings');

  ngOnInit(): void {
    const can = (perm: string) =>
      this.authService.hasPermission(perm) || this.authService.hasRole('Super Admin');

    this.navigationItems.set(
      SETTINGS_NAV_ITEMS
        .filter(item => item.visible(can))
        .map(item => ({ label: item.label, value: item.path })),
    );

    this.selectedNavPath.set(this.resolveActivePath(this.router.url));

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(event => {
      this.selectedNavPath.set(this.resolveActivePath(event.urlAfterRedirects));
    });
  }

  onNavSelect(path: string): void {
    if (path === this.selectedNavPath()) return;
    void this.router.navigateByUrl(path);
  }

  private resolveActivePath(url: string): string {
    const path = url.split('?')[0];
    const visibleItems = SETTINGS_NAV_ITEMS.filter(item =>
      item.visible(perm =>
        this.authService.hasPermission(perm) || this.authService.hasRole('Super Admin'),
      ),
    );

    const exactMatch = visibleItems.find(item => item.exact && path === item.path);
    if (exactMatch) return exactMatch.path;

    const prefixMatch = visibleItems
      .filter(item => !item.exact)
      .filter(item => path === item.path || path.startsWith(`${item.path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0];

    return prefixMatch?.path ?? visibleItems[0]?.path ?? '/settings';
  }
}
