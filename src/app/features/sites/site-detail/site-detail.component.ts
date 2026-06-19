import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SitesService } from '../../../core/services/sites.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { SiteDetail } from '../../../core/models/sites.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
@Component({ selector: 'app-site-detail', standalone: true, imports: [NgIf, RouterLink, MatButtonModule, MatIconModule, SkeletonLoaderComponent, EmptyStateComponent], templateUrl: './site-detail.component.html', styleUrl: './site-detail.component.less' })
export class SiteDetailComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  private readonly breadcrumbService = inject(BreadcrumbService);
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
        this.breadcrumbService.setItems([{ label: 'Sites', route: '/sites' }, { label: s.siteName }]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}