import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _count = signal(0);

  readonly isLoading = computed(() => this._count() > 0);

  show() {
    this._count.update(c => c + 1);
  }

  hide() {
    this._count.update(c => Math.max(0, c - 1));
  }

  clear() {
    this._count.set(0);
  }
}
