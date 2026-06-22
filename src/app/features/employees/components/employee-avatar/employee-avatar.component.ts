import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

export type EmployeeAvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-employee-avatar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './employee-avatar.component.html',
  styleUrl: './employee-avatar.component.less',
})
export class EmployeeAvatarComponent {
  @Input({ required: true }) name = '';
  @Input() photoUrl: string | null = null;
  @Input() size: EmployeeAvatarSize = 'md';

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
