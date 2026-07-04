/** Cursor pagination direction. */
export type CursorDirection = 'next' | 'prev';

/** Query params for cursor-paginated list endpoints. */
export interface CursorPageParams {
  pageSize?: number;
  cursor?: string | null;
  direction?: CursorDirection;
  /** @deprecated Ignored by cursor APIs; kept so transitional callers compile. */
  page?: number;
}

/** Pagination metadata returned by cursor-paginated APIs. */
export interface CursorPaginationMeta {
  pageSize: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Cursor-paginated list result used by list screens.
 * `items` is the collection; `pagination` holds cursor metadata.
 */
export interface CursorPaginatedResult<T> {
  items: T[];
  data?: T[];
  pagination: CursorPaginationMeta;
  /** Transitional fields for screens still reading offset-style metadata. */
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

/**
 * @deprecated Prefer CursorPaginatedResult for list endpoints.
 * Kept for backward compatibility with any remaining offset-based callers.
 */
export interface PaginatedResult<T> {
  items: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  /** Present when API already returns cursor metadata. */
  pagination?: CursorPaginationMeta;
}

export interface ApiError {
  status: number;
  title: string;
  detail?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface SortState {
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export interface PageState {
  page: number;
  pageSize: number;
}

/** Default page size for cursor-paginated lists. */
export const DEFAULT_PAGE_SIZE = 10;
/** Discrete page-size choices exposed in list UIs (plus All). */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 150, 200] as const;
/** Value used when the user selects "All". */
export const ALL_PAGE_SIZE = 10_000;
/** Maximum accepted pageSize (includes All). */
export const MAX_PAGE_SIZE = ALL_PAGE_SIZE;
