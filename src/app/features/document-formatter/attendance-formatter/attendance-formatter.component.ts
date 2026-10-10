import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ClientsService } from '../../../core/services/clients.service';
import { DocumentFormatterService } from '../../../core/services/document-formatter.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClientListItem } from '../../../core/models/client.models';
import {
  DocumentFormatterPreview,
  DocumentFormatterPreviewRow,
} from '../../../core/models/document-formatter.models';
import { MONTH_NAMES } from '../../../core/models/attendance.models';
import { portalYears } from '../../../core/utils/year-options.util';

type RowFilter = 'all' | 'ready' | 'attention';

@Component({
  selector: 'app-attendance-formatter',
  templateUrl: './attendance-formatter.component.html',
  styleUrl: './attendance-formatter.component.less',
})
export class AttendanceFormatterComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly formatter = inject(DocumentFormatterService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly monthNames = MONTH_NAMES;
  readonly loadingClients = signal(true);
  readonly working = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  readonly selectedClientId = signal('');
  readonly file = signal<File | null>(null);
  readonly preview = signal<DocumentFormatterPreview | null>(null);
  readonly rowFilter = signal<RowFilter>('all');

  readonly filters = new FormGroup({
    clientId: new FormControl('', { nonNullable: true }),
    month: new FormControl(new Date().getMonth() + 1, { nonNullable: true }),
    year: new FormControl(new Date().getFullYear(), { nonNullable: true }),
  });

  readonly clientOptions = computed(() =>
    this.clients().map((client) => ({
      key: String(client.id),
      value: client.companyName || client.clientCode || 'Client',
    })),
  );
  readonly selectedClientName = computed(() => {
    const client = this.clients().find((item) => item.id === this.selectedClientId());
    return client?.companyName || client?.clientCode || '';
  });
  readonly canPreview = computed(() => !this.working() && !!this.file() && !!this.selectedClientId());
  readonly canDownload = computed(() => {
    if (!this.canPreview()) return false;
    const matched = this.preview()?.summary.matched;
    return matched == null || matched > 0;
  });
  readonly monthOptions = computed(() =>
    this.monthNames.map((name, index) => ({ key: String(index + 1), value: name })),
  );
  readonly yearOptions = computed(() =>
    portalYears().map((year) => ({ key: String(year), value: String(year) })),
  );

  readonly visibleRows = computed(() => {
    const rows = this.preview()?.rows ?? [];
    const filter = this.rowFilter();
    if (filter === 'ready') return rows.filter((row) => row.status === 'matched' && !row.needsReview);
    if (filter === 'attention') {
      return rows.filter((row) => row.status !== 'matched' || row.needsReview);
    }
    return rows;
  });

  readonly attentionCount = computed(() => {
    const summary = this.preview()?.summary;
    if (!summary) return 0;
    return summary.unmatched + summary.duplicates + summary.invalid + summary.needsReview;
  });

  ngOnInit() {
    this.clientsService.getAllForSelect().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loadingClients.set(false);
      },
      error: () => {
        this.loadingClients.set(false);
        this.notification.error('Could not load clients.');
      },
    });

    this.filters.controls.clientId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((clientId) => {
        this.selectedClientId.set(clientId);
        this.preview.set(null);
        if (this.file()) this.runPreview();
      });
  }

  onClientSelected(value: string | number | { key?: string }) {
    const clientId = typeof value === 'object' ? String(value?.key ?? '') : String(value ?? '');
    if (!clientId) return;
    this.selectedClientId.set(clientId);
    if (this.filters.controls.clientId.value !== clientId) {
      this.filters.controls.clientId.setValue(clientId);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xlsm')) {
      this.notification.error('Upload a .xlsx attendance register.');
      return;
    }
    this.file.set(file);
    this.preview.set(null);
    if (this.selectedClientId()) this.runPreview();
  }

  clearFile() {
    this.file.set(null);
    this.preview.set(null);
  }

  runPreview() {
    const clientId = this.selectedClientId();
    const file = this.file();
    if (!clientId || !file) {
      this.notification.warning('Select a client and the raw Excel file.');
      return;
    }
    this.working.set(true);
    this.formatter.preview(clientId, file).subscribe({
      next: (preview) => {
        this.preview.set(preview);
        this.rowFilter.set(preview.summary.matched ? 'all' : 'attention');
        this.working.set(false);
        const issues = preview.summary.unmatched + preview.summary.duplicates + preview.summary.invalid;
        if (preview.summary.matched && !issues && !preview.summary.needsReview) {
          this.notification.success(`${preview.summary.matched} employees are ready to download.`);
        } else if (preview.summary.matched) {
          this.notification.warning(`${preview.summary.matched} ready. Review the rows that need attention.`);
        } else {
          this.notification.error('No employees matched this client. Check the client and the soft codes.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.working.set(false);
        void this.showError(err, 'Could not read this attendance sheet.');
      },
    });
  }

  useDetectedPeriod() {
    const preview = this.preview();
    if (!preview?.detectedMonth || !preview.detectedYear) return;
    this.filters.patchValue({ month: preview.detectedMonth, year: preview.detectedYear });
  }

  download() {
    const clientId = this.selectedClientId();
    const file = this.file();
    if (!clientId || !file || !this.canDownload()) return;
    const month = Number(this.filters.controls.month.value);
    const year = Number(this.filters.controls.year.value);
    this.working.set(true);
    this.formatter.exportWorkbook(clientId, file, month, year).subscribe({
      next: (response) => {
        this.saveBlob(response);
        this.working.set(false);
        this.notification.success('Attendance sheet downloaded. Import it from the attendance register.');
      },
      error: (err: HttpErrorResponse) => {
        this.working.set(false);
        void this.showError(err, 'Could not build the attendance sheet.');
      },
    });
  }

  setFilter(filter: RowFilter) {
    this.rowFilter.set(filter);
  }

  statusLabel(row: DocumentFormatterPreviewRow): string {
    if (row.status === 'matched' && row.needsReview) return 'Check name';
    if (row.status === 'matched') return 'Ready';
    if (row.status === 'unmatched') return 'Not found';
    if (row.status === 'duplicate') return 'Duplicate';
    return 'Invalid';
  }

  detectedPeriodLabel(): string | null {
    const preview = this.preview();
    if (!preview?.detectedMonth || !preview.detectedYear) return null;
    return `${this.monthNames[preview.detectedMonth - 1]} ${preview.detectedYear}`;
  }

  selectedPeriodDiffers(): boolean {
    const preview = this.preview();
    if (!preview?.detectedMonth || !preview.detectedYear) return false;
    return preview.detectedMonth !== Number(this.filters.controls.month.value)
      || preview.detectedYear !== Number(this.filters.controls.year.value);
  }

  registerLink() {
    const clientId = this.selectedClientId();
    return {
      router: ['/attendance/register'],
      query: {
        clientId,
        month: this.filters.controls.month.value,
        year: this.filters.controls.year.value,
      },
    };
  }

  private saveBlob(response: HttpResponse<Blob>) {
    const blob = response.body;
    if (!blob) return;
    const header = response.headers.get('Content-Disposition') ?? '';
    const match = /filename="([^"]+)"/.exec(header);
    const month = String(this.filters.controls.month.value).padStart(2, '0');
    const filename = match?.[1] ?? `attendance-template-${this.filters.controls.year.value}-${month}.xlsx`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private async showError(err: HttpErrorResponse, fallback: string) {
    const body = err?.error;
    if (body instanceof Blob) {
      try {
        const parsed = JSON.parse(await body.text()) as { detail?: string; title?: string };
        this.notification.error(parsed.detail || parsed.title || fallback);
        return;
      } catch {
        this.notification.error(fallback);
        return;
      }
    }
    const record = body as { detail?: string; title?: string } | undefined;
    this.notification.error(record?.detail || record?.title || fallback);
  }
}
