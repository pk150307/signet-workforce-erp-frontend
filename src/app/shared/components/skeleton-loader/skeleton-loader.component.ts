import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [NgFor],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.less',
})
export class SkeletonLoaderComponent {
  @Input() rows = 5;
  @Input() type: 'table' | 'card' = 'table';

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
