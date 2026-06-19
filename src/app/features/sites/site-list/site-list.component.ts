import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SitesService } from '../../../core/services/sites.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { PaginatedResult } from '../../../core/models/api.models';
import { SiteListItem } from '../../../core/models/sites.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({ selector: 'app-site-list', standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, EmptyStateComponent, SkeletonLoaderComponent],
  templateUrl: './site-list.component.html', styleUrl: './site-list.component.less' })
export class SiteListComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly router = inject(Router);
  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<SiteListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly cols = ['siteCode','siteName','clientCompanyName','city','requiredHeadcount','deployedHeadcount','isActive','actions'];
  page = 1; pageSize = 20;
  ngOnInit() {
    this.breadcrumbService.setItems([{ label: 'Sites' }]);
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => { this.page = 1; this.load(); });
  }
  load() { this.loading.set(true); this.sitesService.getAll({ page: this.page, pageSize: this.pageSize, search: this.searchCtrl.value || undefined }).subscribe({ next: r => { this.data.set(r); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  onPageChange(e: PageEvent) { this.page = e.pageIndex + 1; this.pageSize = e.pageSize; this.load(); }
  viewSite(id: string) { this.router.navigate(['/sites', id]); }
}