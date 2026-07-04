import {
  CursorDirection,
  CursorPaginatedResult,
  DEFAULT_PAGE_SIZE,
} from '../models/api.models';

export interface MockQueryParams {
  pageSize?: number;
  cursor?: string | null;
  direction?: CursorDirection;
  search?: string;
  isActive?: boolean;
}

/**
 * Client-side cursor pagination for mock/local list data.
 * Cursor encodes the zero-based page index as a string.
 */
export function paginateMock<T>(
  items: T[],
  params: MockQueryParams,
  searchFields: (keyof T)[],
): CursorPaginatedResult<T> {
  let filtered = [...items];

  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(item =>
      searchFields.some(field => String(item[field] ?? '').toLowerCase().includes(term)),
    );
  }

  if (params.isActive !== undefined) {
    filtered = filtered.filter(item => (item as { isActive?: boolean }).isActive === params.isActive);
  }

  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1);

  let pageIndex = 0;
  if (params.cursor) {
    const parsed = Number(params.cursor);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      pageIndex = parsed;
    }
  }

  pageIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));
  const start = pageIndex * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const hasNext = start + pageSize < totalCount;
  const hasPrev = pageIndex > 0;

  return {
    items: pageItems,
    data: pageItems,
    pagination: {
      pageSize,
      nextCursor: hasNext ? String(pageIndex + 1) : null,
      prevCursor: hasPrev ? String(pageIndex - 1) : null,
      hasNext,
      hasPrev,
    },
  };
}
