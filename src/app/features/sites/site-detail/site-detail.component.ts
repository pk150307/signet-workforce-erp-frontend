import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SitesService } from '../../../core/services/sites.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SiteDetail } from '../../../core/models/sites.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [
    NgIf, RouterLink, MatButtonModule, MatIconModule,
    SkeletonLoaderComponent, EmptyStateComponent,
  ],
  templateUrl: './site-detail.component.html',
  styleUrl: './site-detail.component.less',
})
export class SiteDetailComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly site = signal<SiteDetail | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.sitesService.getById(id).subscribe({
      next: s => {
        this.site.set(s);
        this.breadcrumbService.updateLast(s.siteName);
        this.loading.set(false);
      },
      error: () => {
        this.site.set(null);
        this.notification.error('Failed to load site details.');
        this.loading.set(false);
      },
    });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'S';
  }

  displayValue(value: string | number | null | undefined): string {
    if (value == null || value === '') return '—';
    return String(value);
  }

  staffingPercent(s: SiteDetail): number {
    if (!s.requiredHeadcount) return s.deployedHeadcount > 0 ? 100 : 0;
    return Math.min(100, Math.round((s.deployedHeadcount / s.requiredHeadcount) * 100));
  }

  headcountGap(s: SiteDetail): number {
    return Math.max(0, s.requiredHeadcount - s.deployedHeadcount);
  }

  isUnderstaffed(s: SiteDetail): boolean {
    return s.requiredHeadcount > 0 && s.deployedHeadcount < s.requiredHeadcount;
  }
}
