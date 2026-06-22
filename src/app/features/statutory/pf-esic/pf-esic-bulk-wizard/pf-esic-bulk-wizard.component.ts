import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

import { PfEsicService } from '../../../../core/services/pf-esic.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PfEsicBulkUpdateItem, PfEsicStatus } from '../../../../core/models/pf-esic.models';

export interface PfEsicBulkWizardData {
  mode: 'update' | 'import';
}

interface ParsedRow extends PfEsicBulkUpdateItem {
  rowIndex: number;
  errors: string[];
}

const UAN_PATTERN = /^\d{12}$/;
const ESIC_PATTERN = /^\d{17}$/;
const STATUS_VALUES: PfEsicStatus[] = ['Active', 'Inactive', 'Pending', 'Suspended'];

@Component({
  selector: 'app-pf-esic-bulk-wizard',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDividerModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './pf-esic-bulk-wizard.component.html',
  styleUrl: './pf-esic-bulk-wizard.component.less',
})
export class PfEsicBulkWizardComponent {

  private readonly dialogRef = inject(MatDialogRef<PfEsicBulkWizardComponent>);
  readonly data = inject<PfEsicBulkWizardData>(MAT_DIALOG_DATA);
  private readonly pfEsicService = inject(PfEsicService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly parsedRows = signal<ParsedRow[]>([]);
  readonly selectedFile = signal<File | null>(null);

  readonly statusOptions = STATUS_VALUES;
  readonly previewColumns = ['employeeCode', 'uanNumber', 'pfNumber', 'esicNumber', 'status', 'errors'];

  readonly manualForm = this.fb.group({
    rows: this.fb.array([this.createRowGroup()]),
  });

  get title(): string {
    return this.data.mode === 'import' ? 'Bulk Import PF/ESIC' : 'Bulk Update PF/ESIC';
  }

  get rows(): FormArray {
    return this.manualForm.get('rows') as FormArray;
  }

  get validRows(): ParsedRow[] {
    return this.parsedRows().filter(r => r.errors.length === 0);
  }

  get invalidRows(): ParsedRow[] {
    return this.parsedRows().filter(r => r.errors.length > 0);
  }

  createRowGroup() {
    return this.fb.group({
      employeeCode: ['', Validators.required],
      uanNumber: [''],
      pfNumber: [''],
      esicNumber: [''],
      status: ['Active' as PfEsicStatus],
      effectiveDate: [''],
    });
  }

  addRow(): void {
    this.rows.push(this.createRowGroup());
  }

  removeRow(index: number): void {
    if (this.rows.length > 1) {
      this.rows.removeAt(index);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      this.parseCsv(text);
    };
    reader.readAsText(file);
  }

  validateManualRows(): boolean {
    const rows = this.manualForm.getRawValue().rows as PfEsicBulkUpdateItem[];
    const parsed = rows.map((row, index) => this.validateRow(row, index + 1));
    this.parsedRows.set(parsed);
    return parsed.every(r => r.errors.length === 0);
  }

  parseCsv(text: string): void {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
      this.parsedRows.set([{ rowIndex: 1, employeeCode: '', errors: ['CSV must contain a header and at least one data row'] }]);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const codeIdx = headers.indexOf('employeecode');
    if (codeIdx === -1) {
      this.parsedRows.set([{ rowIndex: 1, employeeCode: '', errors: ['Missing required column: employeeCode'] }]);
      return;
    }

    const parsed: ParsedRow[] = lines.slice(1).map((line, i) => {
      const cols = line.split(',').map(c => c.trim());
      const row: PfEsicBulkUpdateItem = {
        employeeCode: cols[codeIdx] ?? '',
        uanNumber: cols[headers.indexOf('uannumber')] || undefined,
        pfNumber: cols[headers.indexOf('pfnumber')] || undefined,
        esicNumber: cols[headers.indexOf('esicnumber')] || undefined,
        status: (cols[headers.indexOf('status')] as PfEsicStatus) || undefined,
        effectiveDate: cols[headers.indexOf('effectivedate')] || undefined,
      };
      return this.validateRow(row, i + 2);
    });

    this.parsedRows.set(parsed);
  }

  submit(): void {
    if (this.data.mode === 'import') {
      this.submitImport();
    } else {
      this.submitBulkUpdate();
    }
  }

  private submitImport(): void {
    const file = this.selectedFile();
    if (!file) {
      this.notification.warning('Please select a CSV file to import.');
      return;
    }

    this.submitting.set(true);
    this.pfEsicService.import(file).subscribe({
      next: result => {
        this.submitting.set(false);
        if (result.errors?.length) {
          this.notification.warning(`Imported ${result.imported} records with ${result.errors.length} errors.`);
        } else {
          this.notification.success('Import completed successfully.');
        }
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting.set(false);
        this.notification.error('Import failed.');
      },
    });
  }

  private submitBulkUpdate(): void {
    const items = this.validRows.map(({ rowIndex, errors, ...item }) => item);
    if (!items.length) return;

    this.submitting.set(true);
    this.pfEsicService.bulkUpdate(items).subscribe({
      next: result => {
        this.submitting.set(false);
        this.notification.success(`Updated ${result.updated} records (${result.failed} failed).`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting.set(false);
        this.notification.error('Bulk update failed.');
      },
    });
  }

  private validateRow(row: PfEsicBulkUpdateItem, rowIndex: number): ParsedRow {
    const errors: string[] = [];
    if (!row.employeeCode?.trim()) {
      errors.push('Employee code is required');
    }
    if (row.uanNumber && !UAN_PATTERN.test(row.uanNumber)) {
      errors.push('UAN must be 12 digits');
    }
    if (row.esicNumber && !ESIC_PATTERN.test(row.esicNumber)) {
      errors.push('ESIC must be 17 digits');
    }
    if (row.status && !STATUS_VALUES.includes(row.status)) {
      errors.push('Invalid status');
    }
    return { ...row, rowIndex, errors };
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
