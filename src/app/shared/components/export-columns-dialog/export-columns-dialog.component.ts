import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SharedModule } from '../../shared.module';
import { featureDropdownDialogConfig } from '../../../core/utils/dialog.util';

export interface ExportColumnOption {
  key: string;
  label: string;
}

export type ExportColumnsFormat = 'excel' | 'pdf';

export interface ExportColumnsDialogData {
  format: ExportColumnsFormat;
  columns: readonly ExportColumnOption[];
  title?: string;
}

export interface ExportColumnsDialogResult {
  format: ExportColumnsFormat;
  columns: string[];
}

@Component({
  selector: 'app-export-columns-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './export-columns-dialog.component.html',
  styleUrl: './export-columns-dialog.component.less',
})
export class ExportColumnsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ExportColumnsDialogComponent, ExportColumnsDialogResult | null>);
  readonly data = inject<ExportColumnsDialogData>(MAT_DIALOG_DATA);

  readonly columns = this.data.columns;
  readonly selected = signal<Set<string>>(new Set(this.columns.map((column) => column.key)));

  get title(): string {
    if (this.data.title) return this.data.title;
    return this.data.format === 'pdf' ? 'Export PDF' : 'Export Excel';
  }

  isSelected(key: string): boolean {
    return this.selected().has(key);
  }

  toggle(key: string, event: { checked: boolean }): void {
    const next = new Set(this.selected());
    if (event.checked) next.add(key);
    else next.delete(key);
    this.selected.set(next);
  }

  toggleAll(event: { checked: boolean }): void {
    this.selected.set(event.checked ? new Set(this.columns.map((column) => column.key)) : new Set());
  }

  isAllSelected(): boolean {
    return this.selected().size === this.columns.length;
  }

  confirm(): void {
    const columns = this.columns.map((column) => column.key).filter((key) => this.selected().has(key));
    if (!columns.length) return;
    this.dialogRef.close({ format: this.data.format, columns });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}

export function openExportColumnsDialog(
  dialog: MatDialog,
  data: ExportColumnsDialogData,
): Observable<ExportColumnsDialogResult | null> {
  return dialog.open(ExportColumnsDialogComponent, featureDropdownDialogConfig({
    width: '560px',
    data,
  })).afterClosed();
}
