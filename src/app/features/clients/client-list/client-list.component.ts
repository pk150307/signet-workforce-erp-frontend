import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../core/models/api.models';

interface ClientListItem {
  id: string; clientCode: string; companyName: string; contactPerson: string;
  email: string; phone: string; city: string; state: string;
  isActive: boolean; totalSites: number;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.less',
})
export class ClientListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly searchCtrl = new FormControl('');
  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<ClientListItem> | null>(null);
  readonly cols = ['clientCode', 'companyName', 'contactPerson', 'location', 'status', 'actions'];

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => this.load());
  }

  load() {
    this.loading.set(true);
    let params = new HttpParams().set('page', 1).set('pageSize', 20);
    if (this.searchCtrl.value) params = params.set('search', this.searchCtrl.value);
    this.http.get<PaginatedResult<ClientListItem>>(`${environment.apiUrl}/clients`, { params }).subscribe({
      next: r => { this.data.set(r); this.loading.set(false); },
      error: () => {
        this.data.set({ items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
        this.loading.set(false);
      }
    });
  }
}
