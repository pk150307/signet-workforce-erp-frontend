export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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
