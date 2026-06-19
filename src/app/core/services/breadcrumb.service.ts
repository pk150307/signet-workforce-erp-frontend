import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly _items = signal<BreadcrumbItem[]>([{ label: 'Home', route: '/dashboard' }]);

  readonly items = this._items.asReadonly();

  setItems(items: BreadcrumbItem[]) {
    this._items.set(items);
  }
}
