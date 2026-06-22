import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClientsService } from '../../../core/services/clients.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DesignationService } from '../../../core/services/designation.service';
import { DesignationGradeService } from '../../../core/services/designation-grade.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { ClientDetail } from '../../../core/models/client.models';
import { DepartmentListItem } from '../../../core/models/department.models';
import { DesignationListItem } from '../../../core/models/designation.models';
import { DesignationGradeListItem } from '../../../core/models/designation-grade.models';
import { SiteListItem } from '../../../core/models/sites.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    NgIf,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.less',
})
export class ClientDetailComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly departmentService = inject(DepartmentService);
  private readonly designationService = inject(DesignationService);
  private readonly gradeService = inject(DesignationGradeService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly client = signal<ClientDetail | null>(null);
  readonly sites = signal<SiteListItem[]>([]);
  readonly departments = signal<DepartmentListItem[]>([]);
  readonly designations = signal<DesignationListItem[]>([]);
  readonly payGrades = signal<DesignationGradeListItem[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.load(id);
  }

  load(id: string) {
    this.loading.set(true);

    forkJoin({
      client: this.clientsService.getById(id),
      sites: this.clientsService.getSitesForSelect(id).pipe(catchError(() => of([] as SiteListItem[]))),
      departments: this.departmentService.getAllForSelect({ clientId: id, isActive: true }).pipe(
        catchError(() => of([] as DepartmentListItem[])),
      ),
      designations: this.designationService.getAllForSelect({ clientId: id, isActive: true }).pipe(
        catchError(() => of([] as DesignationListItem[])),
      ),
      grades: this.gradeService.getAll({ page: 1, pageSize: 500, clientId: id, isActive: true }).pipe(
        catchError(() => of({ items: [] as DesignationGradeListItem[] })),
      ),
    }).subscribe({
      next: ({ client, sites, departments, designations, grades }) => {
        this.client.set(client);
        this.sites.set(sites);
        this.departments.set(departments);
        this.designations.set(designations);
        this.payGrades.set(grades.items);
        this.breadcrumbService.updateLast(client.companyName);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'C';
  }

  totalDeployed(): number {
    return this.sites().reduce((sum, s) => sum + (s.deployedHeadcount ?? 0), 0);
  }

  totalRequired(): number {
    return this.sites().reduce((sum, s) => sum + (s.requiredHeadcount ?? 0), 0);
  }

  staffingPercent(): number {
    const required = this.totalRequired();
    if (!required) return 0;
    return Math.min(100, Math.round((this.totalDeployed() / required) * 100));
  }

  formatAddress(c: ClientDetail): string {
    const parts = [c.address, c.city, c.state, c.pinCode].filter(Boolean);
    return parts.join(', ');
  }
}
