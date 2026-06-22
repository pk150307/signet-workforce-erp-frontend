import { ActivatedRouteSnapshot } from '@angular/router';
import { BreadcrumbItem } from '../services/breadcrumb.service';

export type RouteBreadcrumb = string | BreadcrumbItem;
export type RouteBreadcrumbData = RouteBreadcrumb | RouteBreadcrumb[];

function normalizeSingle(entry: RouteBreadcrumb): BreadcrumbItem {
  if (typeof entry === 'string') {
    return { label: entry };
  }
  return { label: entry.label, route: entry.route };
}

function normalizeBreadcrumb(data: RouteBreadcrumbData): BreadcrumbItem[] {
  if (Array.isArray(data)) {
    return data.map((entry) => normalizeSingle(entry));
  }
  return [normalizeSingle(data)];
}

export function buildBreadcrumbsFromSnapshot(leaf: ActivatedRouteSnapshot): BreadcrumbItem[] {
  const entries: { item: BreadcrumbItem; snapshot: ActivatedRouteSnapshot }[] = [];

  for (const snapshot of leaf.pathFromRoot) {
    const data = snapshot.data['breadcrumb'] as RouteBreadcrumbData | undefined;
    if (data == null) continue;

    for (const item of normalizeBreadcrumb(data)) {
      entries.push({ item, snapshot });
    }
  }

  if (entries.length === 0) {
    return [{ label: 'Dashboard' }];
  }

  const pathSegments: string[] = [];
  const autoRoutes: (string | undefined)[] = entries.map(() => undefined);

  for (const snapshot of leaf.pathFromRoot) {
    for (const segment of snapshot.url) {
      if (segment.path) {
        pathSegments.push(segment.path);
      }
    }

    const indexes = entries
      .map((entry, index) => (entry.snapshot === snapshot ? index : -1))
      .filter((index) => index >= 0);

    for (const index of indexes) {
      autoRoutes[index] = '/' + pathSegments.join('/');
    }
  }

  return entries.map(({ item }, index) => {
    const isLast = index === entries.length - 1;
    if (isLast) {
      return { label: item.label };
    }

    return {
      label: item.label,
      route: item.route ?? autoRoutes[index] ?? '/dashboard',
    };
  });
}
