import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { EmployeeDocumentService } from '../../../../core/services/employee-document.service';

export type EmployeeAvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-employee-avatar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './employee-avatar.component.html',
  styleUrl: './employee-avatar.component.less',
})
export class EmployeeAvatarComponent implements OnChanges {
  private readonly documentService = inject(EmployeeDocumentService);

  @Input({ required: true }) name = '';
  @Input() photoUrl: string | null = null;
  @Input() employeeId: string | null = null;
  @Input() size: EmployeeAvatarSize = 'md';

  readonly resolvedPhotoUrl = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photoUrl'] || changes['employeeId']) {
      this.resolvePhoto();
    }
  }

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  private resolvePhoto(): void {
    if (this.photoUrl) {
      this.resolvedPhotoUrl.set(this.photoUrl);
      return;
    }

    if (!this.employeeId) {
      this.resolvedPhotoUrl.set(null);
      return;
    }

    this.documentService.getProfilePhotoSignedUrl(this.employeeId).subscribe({
      next: (url) => this.resolvedPhotoUrl.set(url || null),
      error: () => this.resolvedPhotoUrl.set(null),
    });
  }
}
