import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CursorDirection, DEFAULT_PAGE_SIZE } from '../../../core/models/api.models';

export type PaginationNavigateEvent =
  | { direction: CursorDirection; cursor: string }
  | { direction: 'next' | 'prev'; cursor?: string; url?: string };

@Component({
  selector: 'signet-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.less',
})
export class PaginationComponent {
  @Input() width: number | string = '100';
  @Input() widthUnit: 'px' | '%' | 'rem' | 'em' = '%';
  @Input() heightUnit: 'px' | '%' | 'rem' | 'em' = 'px';
  @Input() height: number = 47;

  /** Legacy URL-based tokens (kept for backward compatibility). */
  @Input() previousUrl: string = '';
  @Input() nextUrl: string = '';

  /** Cursor-based controls. */
  @Input() hasPrev = false;
  @Input() hasNext = false;
  @Input() prevCursor: string | null = null;
  @Input() nextCursor: string | null = null;
  @Input() pageSize: number = DEFAULT_PAGE_SIZE;
  @Input() showPageSize = true;

  /** Emits cursor navigation intent. */
  @Output() readonly pageChange = new EventEmitter<PaginationNavigateEvent>();

  /** Legacy navigate emitter (URL string). */
  @Output() readonly navigate = new EventEmitter<string>();

  get canGoPrev(): boolean {
    if (this.prevCursor || this.hasPrev) {
      return this.hasPrev && Boolean(this.prevCursor);
    }
    return Boolean(this.previousUrl) && this.previousUrl !== 'None';
  }

  get canGoNext(): boolean {
    if (this.nextCursor || this.hasNext) {
      return this.hasNext && Boolean(this.nextCursor);
    }
    return Boolean(this.nextUrl) && this.nextUrl !== 'None';
  }

  onPrevious(): void {
    if (!this.canGoPrev) return;

    if (this.prevCursor) {
      const event: PaginationNavigateEvent = { direction: 'prev', cursor: this.prevCursor };
      this.pageChange.emit(event);
      this.navigate.emit(this.prevCursor);
      return;
    }

    this.pageChange.emit({ direction: 'prev', url: this.previousUrl });
    this.navigate.emit(this.previousUrl);
  }

  onNext(): void {
    if (!this.canGoNext) return;

    if (this.nextCursor) {
      const event: PaginationNavigateEvent = { direction: 'next', cursor: this.nextCursor };
      this.pageChange.emit(event);
      this.navigate.emit(this.nextCursor);
      return;
    }

    this.pageChange.emit({ direction: 'next', url: this.nextUrl });
    this.navigate.emit(this.nextUrl);
  }
}
