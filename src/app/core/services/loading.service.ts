import { Injectable, inject, signal, computed } from '@angular/core';
import { SharedService } from '../../shared/shared.service';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly sharedService = inject(SharedService);
  private readonly _count = signal(0);

  readonly isLoading = computed(() => this._count() > 0);

  show() {
    const next = this._count() + 1;
    this._count.set(next);
    if (next === 1) {
      this.sharedService.toggleGlobalLoader(true);
    }
  }

  hide() {
    const next = Math.max(0, this._count() - 1);
    this._count.set(next);
    if (next === 0) {
      this.sharedService.toggleGlobalLoader(false);
    }
  }

  clear() {
    this._count.set(0);
    this.sharedService.toggleGlobalLoader(false);
  }
}
