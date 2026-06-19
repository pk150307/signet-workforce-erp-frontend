import { PaginatedResult } from '../models/api.models';

export interface MockQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export function paginateMock<T>(
  items: T[],
  params: MockQueryParams,
  searchFields: (keyof T)[]
): PaginatedResult<T> {
  let filtered = [...items];

  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(item =>
      searchFields.some(field => String(item[field] ?? '').toLowerCase().includes(term))
    );
  }

  if (params.isActive !== undefined) {
    filtered = filtered.filter(item => (item as { isActive?: boolean }).isActive === params.isActive);
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}
