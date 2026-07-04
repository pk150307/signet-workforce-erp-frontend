import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';

export type EmployeeAvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-employee-avatar',
  templateUrl: './employee-avatar.component.html',
  styleUrl: './employee-avatar.component.less',
})
export class EmployeeAvatarComponent implements OnChanges {
  @Input({ required: true }) name = '';
  @Input() photoUrl: string | null = null;
  @Input() size: EmployeeAvatarSize = 'md';

  readonly resolvedPhotoUrl = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photoUrl']) {
      this.resolvedPhotoUrl.set(this.photoUrl?.trim() || null);
    }
  }

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
