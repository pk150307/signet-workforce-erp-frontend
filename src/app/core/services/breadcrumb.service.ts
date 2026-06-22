import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { buildBreadcrumbsFromSnapshot } from '../utils/breadcrumb.util';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private connected = false;

  private readonly _items = signal<BreadcrumbItem[]>([{ label: 'Dashboard' }]);

  readonly items = this._items.asReadonly();

  connect(): void {
    if (this.connected) return;
    this.connected = true;

    this.syncFromRoute();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.syncFromRoute());
  }

  setItems(items: BreadcrumbItem[]) {
    this._items.set(items);
  }

  updateLast(label: string) {
    const current = [...this._items()];
    if (!current.length) return;
    current[current.length - 1] = { label };
    this._items.set(current);
  }

  reset() {
    this._items.set([{ label: 'Dashboard' }]);
  }

  private syncFromRoute(): void {
    let leaf = this.router.routerState.snapshot.root;
    while (leaf.firstChild) {
      leaf = leaf.firstChild;
    }

    this._items.set(buildBreadcrumbsFromSnapshot(leaf));
  }
}
