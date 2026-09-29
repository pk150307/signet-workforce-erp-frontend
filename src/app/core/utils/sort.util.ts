export type SortDir = 'asc' | 'desc';

export function toggleSortState(
  currentBy: string,
  currentDir: SortDir,
  active: string,
): { sortBy: string; sortDir: SortDir } {
  if (currentBy === active) {
    return { sortBy: active, sortDir: currentDir === 'asc' ? 'desc' : 'asc' };
  }
  return { sortBy: active, sortDir: 'asc' };
}

export function sortIconName(sortBy: string, sortDir: SortDir, active: string): string {
  if (sortBy !== active) return 'unfold_more';
  return sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward';
}

export function compareBy<T>(
  a: T,
  b: T,
  read: (row: T) => unknown,
  dir: SortDir,
): number {
  const left = String(read(a) ?? '').toLowerCase();
  const right = String(read(b) ?? '').toLowerCase();
  const cmp = left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
  return dir === 'asc' ? cmp : -cmp;
}
