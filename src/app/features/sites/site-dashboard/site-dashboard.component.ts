import { Component, OnInit, inject, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { SitesService } from '../../../core/services/sites.service';
import { SiteSummary } from '../../../core/models/sites.models';
@Component({
  selector: 'app-site-dashboard',
    templateUrl: './site-dashboard.component.html',
  styleUrl: './site-dashboard.component.less',
})
export class SiteDashboardComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  readonly router = inject(Router);
  readonly loading = signal(true);
  readonly summary = signal<SiteSummary | null>(null);
  ngOnInit() { this.load(); }
  load() { this.loading.set(true); this.sitesService.getSummary().subscribe({ next: s => { this.summary.set(s); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}