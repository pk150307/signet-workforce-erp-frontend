import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeDocumentType } from '../../../../core/models/employee.models';

export interface DocumentUploadEvent {
  type: EmployeeDocumentType;
  file: File;
  label?: string;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.less',
})
export class DocumentUploadComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) documentType!: EmployeeDocumentType;
  @Input() accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
  @Input() required = false;
  @Input() hint = 'Drag & drop or click to upload';
  @Input() fileName: string | null = null;
  @Input() previewUrl: string | null = null;
  @Input() uploading = false;

  @Output() fileSelected = new EventEmitter<DocumentUploadEvent>();
  @Output() removeFile = new EventEmitter<void>();

  readonly dragOver = signal(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.emitFile(file);
  }

  onFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.emitFile(file);
    input.value = '';
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.removeFile.emit();
  }

  private emitFile(file: File) {
    this.fileSelected.emit({ type: this.documentType, file, label: this.label });
  }
}
