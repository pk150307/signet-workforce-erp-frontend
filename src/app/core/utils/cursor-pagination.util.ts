import { HttpParams } from '@angular/common/http';
import {
  ALL_PAGE_SIZE,
  CursorDirection,
  CursorPageParams,
  CursorPaginatedResult,
  CursorPaginationMeta,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  PaginatedResult,
} from '../models/api.models';
import { camelCaseKeys } from './api-response.util';

export { ALL_PAGE_SIZE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS };

export const EMPTY_CURSOR_PAGINATION: CursorPaginationMeta = {
  pageSize: DEFAULT_PAGE_SIZE,
  nextCursor: null,
  prevCursor: null,
  hasNext: false,
  hasPrev: false,
};

export function emptyCursorPage<T>(pageSize = DEFAULT_PAGE_SIZE): CursorPaginatedResult<T> {
  return {
    items: [],
    pagination: { ...EMPTY_CURSOR_PAGINATION, pageSize },
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

function withLegacyFields<T>(result: CursorPaginatedResult<T>): CursorPaginatedResult<T> {
  const pageSize = result.pagination.pageSize || DEFAULT_PAGE_SIZE;
  return {
    ...result,
    page: 1,
    pageSize,
    totalCount: result.items.length + (result.pagination.hasNext ? pageSize : 0),
    totalPages: result.pagination.hasNext ? 2 : 1,
    hasPreviousPage: result.pagination.hasPrev,
    hasNextPage: result.pagination.hasNext,
  };
}

/** Client-side cursor pagination state for list screens. */
export class CursorPaginationState {
  pageSize = DEFAULT_PAGE_SIZE;
  currentNextCursor: string | null = null;
  currentPrevCursor: string | null = null;
  hasNext = false;
  hasPrev = false;
  /** Cursor used for the in-flight / last successful request. */
  private activeCursor: string | null = null;
  private activeDirection: CursorDirection = 'next';

  /** Params for the first page (no cursor). */
  firstPageParams(): CursorPageParams {
    this.activeCursor = null;
    this.activeDirection = 'next';
    return { pageSize: this.pageSize, direction: 'next' };
  }

  /** Params for the next page using stored nextCursor. */
  nextPageParams(): CursorPageParams | null {
    if (!this.hasNext || !this.currentNextCursor) return null;
    this.activeCursor = this.currentNextCursor;
    this.activeDirection = 'next';
    return {
      pageSize: this.pageSize,
      cursor: this.currentNextCursor,
      direction: 'next',
    };
  }

  /** Params for the previous page using stored prevCursor. */
  prevPageParams(): CursorPageParams | null {
    if (!this.hasPrev || !this.currentPrevCursor) return null;
    this.activeCursor = this.currentPrevCursor;
    this.activeDirection = 'prev';
    return {
      pageSize: this.pageSize,
      cursor: this.currentPrevCursor,
      direction: 'prev',
    };
  }

  /** Params for the current page (refresh after CRUD). */
  currentPageParams(): CursorPageParams {
    return {
      pageSize: this.pageSize,
      cursor: this.activeCursor,
      direction: this.activeDirection,
    };
  }

  /** Reset to first page (call when filters/search change). */
  reset(): void {
    this.currentNextCursor = null;
    this.currentPrevCursor = null;
    this.hasNext = false;
    this.hasPrev = false;
    this.activeCursor = null;
    this.activeDirection = 'next';
  }

  /** Change page size and return first-page params. */
  setPageSize(pageSize: number): CursorPageParams {
    this.pageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
    this.reset();
    return this.firstPageParams();
  }

  /** Apply metadata from an API response. */
  apply(meta: CursorPaginationMeta | null | undefined): void {
    const pagination = meta ?? EMPTY_CURSOR_PAGINATION;
    this.pageSize = pagination.pageSize || this.pageSize || DEFAULT_PAGE_SIZE;
    this.currentNextCursor = pagination.nextCursor ?? null;
    this.currentPrevCursor = pagination.prevCursor ?? null;
    this.hasNext = Boolean(pagination.hasNext);
    this.hasPrev = Boolean(pagination.hasPrev);
  }

  /** Values for signet-pagination bindings. */
  get previousToken(): string {
    return this.hasPrev && this.currentPrevCursor ? this.currentPrevCursor : '';
  }

  get nextToken(): string {
    return this.hasNext && this.currentNextCursor ? this.currentNextCursor : '';
  }
}

/** Append cursor pagination params onto HttpParams (skips empty values). */
export function appendCursorParams(
  params: HttpParams,
  query: CursorPageParams = {},
): HttpParams {
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  params = params.set('pageSize', String(pageSize));

  if (query.cursor) {
    params = params.set('cursor', query.cursor);
  }

  const direction = query.direction ?? 'next';
  params = params.set('direction', direction);

  return params;
}

/** Build HttpParams from a plain query object plus cursor fields. */
export function toHttpParams(
  query: Record<string, unknown> & CursorPageParams,
  options?: { omitKeys?: string[] },
): HttpParams {
  const omit = new Set(options?.omitKeys ?? []);
  let params = new HttpParams();

  Object.entries(query).forEach(([key, value]) => {
    if (omit.has(key)) return;
    if (key === 'pageSize' || key === 'cursor' || key === 'direction' || key === 'page') return;
    if (value === undefined || value === null || value === '') return;
    params = params.set(key, String(value));
  });

  return appendCursorParams(params, {
    pageSize: query.pageSize,
    cursor: query.cursor,
    direction: query.direction,
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (value != null && value !== '') return String(value);
  }
  return null;
}

function pickBool(record: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

/**
 * Normalize any list API payload into CursorPaginatedResult.
 * Supports:
 * - { data: [], pagination: { ... } }
 * - { items: [], pagination: { ... } }
 * - legacy offset { items, page, pageSize, totalCount, hasNextPage, hasPreviousPage }
 * - bare arrays
 */
export function normalizeCursorPaginated<T>(
  response: unknown,
  mapItem?: (raw: unknown) => T,
): CursorPaginatedResult<T> {
  return withLegacyFields(normalizeCursorPaginatedCore(response, mapItem));
}

function normalizeCursorPaginatedCore<T>(
  response: unknown,
  mapItem?: (raw: unknown) => T,
): CursorPaginatedResult<T> {
  const mapItems = (list: unknown[]): T[] =>
    mapItem
      ? list.map(mapItem)
      : list.map(item => camelCaseKeys<T>(item));

  if (Array.isArray(response)) {
    const items = mapItems(response);
    return {
      items,
      pagination: {
        pageSize: items.length || DEFAULT_PAGE_SIZE,
        nextCursor: null,
        prevCursor: null,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  if (!response || typeof response !== 'object') {
    return emptyCursorPage<T>();
  }

  const root = camelCaseKeys<Record<string, unknown>>(response);
  const nestedData = root['data'];
  const nestedPagination = asRecord(root['pagination'] ?? root['Pagination']);

  // Cursor contract: { data: [...], pagination: {...} }
  if (Array.isArray(nestedData)) {
    const items = mapItems(nestedData);
    return {
      items,
      data: items,
      pagination: mapPaginationMeta(nestedPagination, items),
    };
  }

  // Nested object that itself may be paginated
  if (nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)) {
    const nested = asRecord(nestedData);
    const nestedItems = nested['items'] ?? nested['Items'] ?? nested['data'] ?? nested['Data'];
    if (Array.isArray(nestedItems)) {
      const items = mapItems(nestedItems);
      const paginationRaw = asRecord(nested['pagination'] ?? nestedPagination);
      return {
        items,
        data: items,
        pagination: mapPaginationMeta(paginationRaw, items, nested),
      };
    }
  }

  const legacyItems = root['items'] ?? root['Items'];
  if (Array.isArray(legacyItems)) {
    const items = mapItems(legacyItems);
    if (Object.keys(nestedPagination).length > 0) {
      return {
        items,
        data: items,
        pagination: mapPaginationMeta(nestedPagination, items, root),
      };
    }
    // Legacy offset pagination → cursor-shaped metadata
    const page = Number(root['page'] ?? root['Page'] ?? 1);
    const hasNext = Boolean(pickBool(root, 'hasNextPage', 'hasNext'));
    const hasPrev = Boolean(pickBool(root, 'hasPreviousPage', 'hasPrev'));
    return {
      items,
      data: items,
      pagination: {
        pageSize: Number(root['pageSize'] ?? root['PageSize'] ?? items.length) || DEFAULT_PAGE_SIZE,
        nextCursor: hasNext ? `__offset_${page + 1}` : null,
        prevCursor: hasPrev ? `__offset_${page - 1}` : null,
        hasNext,
        hasPrev,
      },
    };
  }

  return emptyCursorPage<T>();
}

function mapPaginationMeta(
  pagination: Record<string, unknown>,
  items: unknown[],
  fallback: Record<string, unknown> = {},
): CursorPaginationMeta {
  const pageSize = Number(
    pagination['pageSize']
    ?? pagination['PageSize']
    ?? fallback['pageSize']
    ?? fallback['PageSize']
    ?? items.length
    ?? DEFAULT_PAGE_SIZE,
  );

  const nextCursor = pickString(pagination, 'nextCursor', 'NextCursor');
  const prevCursor = pickString(pagination, 'prevCursor', 'PrevCursor');

  const hasNext = pickBool(pagination, 'hasNext', 'HasNext')
    ?? pickBool(fallback, 'hasNextPage', 'hasNext')
    ?? Boolean(nextCursor);

  const hasPrev = pickBool(pagination, 'hasPrev', 'HasPrev')
    ?? pickBool(fallback, 'hasPreviousPage', 'hasPrev')
    ?? Boolean(prevCursor);

  return {
    pageSize: pageSize || DEFAULT_PAGE_SIZE,
    nextCursor: hasNext ? nextCursor : null,
    prevCursor: hasPrev ? prevCursor : null,
    hasNext: Boolean(hasNext),
    hasPrev: Boolean(hasPrev),
  };
}

/** Convert cursor result to legacy PaginatedResult for transitional callers. */
export function cursorToLegacyPage<T>(
  result: CursorPaginatedResult<T>,
  page = 1,
): PaginatedResult<T> {
  const pageSize = result.pagination.pageSize || DEFAULT_PAGE_SIZE;
  const itemCount = result.items.length;
  // Without totalCount, approximate conservatively.
  const totalCount = itemCount + (result.pagination.hasNext ? pageSize : 0)
    + (result.pagination.hasPrev ? (page - 1) * pageSize : 0);

  return {
    items: result.items,
    page,
    pageSize,
    totalCount,
    totalPages: result.pagination.hasNext ? page + 1 : page,
    hasPreviousPage: result.pagination.hasPrev,
    hasNextPage: result.pagination.hasNext,
    pagination: result.pagination,
  };
}

/** Detect invalid-cursor API errors (reload first page). */
export function isInvalidCursorError(err: unknown): boolean {
  const error = err as { status?: number; error?: { detail?: string; title?: string; message?: string } };
  if (error?.status === 400 || error?.status === 422) {
    const message = `${error.error?.detail ?? ''} ${error.error?.title ?? ''} ${error.error?.message ?? ''}`.toLowerCase();
    return message.includes('cursor') || message.includes('invalid');
  }
  return false;
}

/**
 * Resolve pagination UI events (prev/next or page-size change) into request params.
 * Returns null when navigation is not possible.
 */
export function resolvePaginationNavigate(
  pager: CursorPaginationState,
  event: { pageSize?: number; direction?: CursorDirection | 'next' | 'prev' },
): CursorPageParams | null {
  if (event.pageSize != null) {
    return pager.setPageSize(event.pageSize);
  }
  if (event.direction === 'next') {
    return pager.nextPageParams();
  }
  if (event.direction === 'prev') {
    return pager.prevPageParams();
  }
  return null;
}
