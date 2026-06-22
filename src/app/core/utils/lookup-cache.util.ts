import { Observable, shareReplay } from 'rxjs';

const namespaces = new Map<string, Map<string, Observable<unknown>>>();

/** Stable cache key from query/filter params. */
export function lookupCacheKey(params: Record<string, unknown> = {}): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export function cachedLookup<T>(
  namespace: string,
  key: string,
  factory: () => Observable<T>,
): Observable<T> {
  let ns = namespaces.get(namespace);
  if (!ns) {
    ns = new Map();
    namespaces.set(namespace, ns);
  }
  if (!ns.has(key)) {
    ns.set(key, factory().pipe(shareReplay(1)));
  }
  return ns.get(key)! as Observable<T>;
}

export function invalidateLookupCache(namespace?: string): void {
  if (namespace) {
    namespaces.delete(namespace);
  } else {
    namespaces.clear();
  }
}

export function invalidateLookupKey(namespace: string, key: string): void {
  namespaces.get(namespace)?.delete(key);
}
