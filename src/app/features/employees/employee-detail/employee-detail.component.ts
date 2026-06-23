import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeDocumentService } from '../../../core/services/employee-document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  EmployeeDetail,
  EmployeeDocument,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_DOCUMENT_LABELS,
  GENDER_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from '../../../core/models/employee.models';
import { SafeDatePipe } from '../../../shared/pipes/safe-date.pipe';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgClass,
    SafeDatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.less',
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly employeeService = inject(EmployeeService);
  private readonly documentService = inject(EmployeeDocumentService);
  private readonly notification = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly apiUnavailable = signal(false);
  readonly employee = signal<EmployeeDetail | null>(null);
  readonly documents = signal<EmployeeDocument[]>([]);
  readonly documentsLoading = signal(false);
  readonly downloadingId = signal<string | null>(null);
  readonly viewingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly statusLabels = EMPLOYEE_STATUS_LABELS;
  readonly genderLabels = GENDER_LABELS;
  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly docLabels = EMPLOYEE_DOCUMENT_LABELS;

  activeTab = 0;
  private employeeId = '';

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'];
    this.loadEmployee(this.employeeId);
    this.loadDocuments(this.employeeId);
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.employeeService.getById(id).subscribe({
      next: (emp) => {
        this.employee.set(emp);
        this.breadcrumbService.updateLast(`${emp.firstName} ${emp.lastName}`.trim());
        this.loading.set(false);
      },
      error: () => {
        this.apiUnavailable.set(true);
        this.notification.warning('Server unavailable — showing sample employee data.');
        this.loading.set(false);
      },
    });
  }

  loadDocuments(employeeId: string) {
    this.documentsLoading.set(true);
    this.documentService.getAll(employeeId).subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.documentsLoading.set(false);
      },
      error: () => {
        this.documents.set([]);
        this.documentsLoading.set(false);
      },
    });
  }

  downloadDocument(doc: EmployeeDocument) {
    if (this.downloadingId() || this.viewingId()) return;

    this.downloadingId.set(doc.id);
    this.documentService.downloadToFile(this.employeeId, doc).subscribe({
      next: () => {
        this.notification.success(`${doc.label} downloaded.`);
        this.downloadingId.set(null);
      },
      error: (err: Error) => {
        this.notification.error(err.message || `Could not download ${doc.label}.`);
        this.downloadingId.set(null);
      },
    });
  }

  openDocument(doc: EmployeeDocument) {
    if (this.viewingId() || this.downloadingId()) return;

    if (doc.fileUrl && !doc.fileUrl.includes('.s3.')) {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    this.viewingId.set(doc.id);
    this.documentService.openInNewTab(this.employeeId, doc).subscribe({
      next: () => this.viewingId.set(null),
      error: (err: Error) => {
        this.notification.error(err.message || `Could not open ${doc.label}.`);
        this.viewingId.set(null);
      },
    });
  }

  deleteDocument(doc: EmployeeDocument) {
    if (this.deletingId()) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Remove Document',
        message: `Remove "${doc.label}" (${doc.fileName})? This cannot be undone.`,
        confirmLabel: 'Remove',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.deletingId.set(doc.id);
      this.documentService.delete(this.employeeId, doc.id).subscribe({
        next: () => {
          this.documents.update(docs => docs.filter(d => d.id !== doc.id));
          this.notification.success(`${doc.label} removed.`);
          this.deletingId.set(null);
        },
        error: () => {
          this.notification.error(`Could not remove ${doc.label}.`);
          this.deletingId.set(null);
        },
      });
    });
  }

  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  docTypeLabel(type: EmployeeDocument['type']): string {
    return this.docLabels[type] ?? type;
  }

  getStatusClass(status: number): string {
    const map: Record<number, string> = {
      0: 'draft',
      1: 'active',
      2: 'inactive',
      3: 'onleave',
    };
    return map[status] ?? 'draft';
  }
}
