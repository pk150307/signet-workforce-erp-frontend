import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SitesService } from '../../../core/services/sites.service';
import { ClientsService } from '../../../core/services/clients.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { runDeleteWithApproval } from '../../../core/utils/delete-record.util';
import { PaginatedResult } from '../../../core/models/api.models';
import { SiteListItem } from '../../../core/models/sites.models';
import { ClientListItem } from '../../../core/models/client.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-site-list',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, RouterLink, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, EmptyStateComponent, SkeletonLoaderComponent,
  ],
  templateUrl: './site-list.component.html',
  styleUrl: './site-list.component.less',
})
export class SiteListComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<SiteListItem> | null>(null);
  readonly clients = signal<ClientListItem[]>([]);
  readonly searchCtrl = new FormControl('');
  readonly clientCtrl = new FormControl<string | null>(null);
  readonly statusCtrl = new FormControl<boolean | null>(null);
  readonly cols = ['siteCode', 'siteName', 'clientCompanyName', 'city', 'requiredHeadcount', 'deployedHeadcount', 'isActive', 'actions'];
  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.clientsService.getAllForSelect().subscribe({
      next: list => this.clients.set(list),
      error: () => this.clients.set([]),
    });
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.clientCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.sitesService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      clientId: this.clientCtrl.value || undefined,
      isActive: this.statusCtrl.value ?? undefined,
    }).subscribe({
      next: r => {
        this.data.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load sites.');
        this.loading.set(false);
      },
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.clientCtrl.setValue(null);
    this.statusCtrl.setValue(null);
  }

  onPageChange(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }

  viewSite(id: string) {
    this.router.navigate(['/sites', id]);
  }

  deleteSite(site: SiteListItem) {
    runDeleteWithApproval({
      auth: this.authService,
      dialog: this.dialog,
      notification: this.notification,
      title: 'Delete Site',
      entityLabel: site.siteName,
      deleteFn: (reason) => this.sitesService.delete(site.id, site.clientId, { reason }),
      onSuccess: () => this.load(),
    });
  }
}
