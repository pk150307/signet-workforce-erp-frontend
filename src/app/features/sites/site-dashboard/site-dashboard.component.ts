import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SitesService } from '../../../core/services/sites.service';
import { SiteSummary } from '../../../core/models/sites.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({ selector: 'app-site-dashboard', standalone: true, imports: [NgIf, RouterLink, MatButtonModule, MatIconModule, SkeletonLoaderComponent], templateUrl: './site-dashboard.component.html', styleUrl: './site-dashboard.component.less' })
export class SiteDashboardComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  readonly loading = signal(true);
  readonly summary = signal<SiteSummary | null>(null);
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.sitesService.getSummary().subscribe({ next: s => { this.summary.set(s); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}