/** Inclusive year range used by every portal year dropdown. */
export const PORTAL_YEAR_MIN = 2000;
export const PORTAL_YEAR_MAX = 2050;

export function portalYears(start = PORTAL_YEAR_MIN, end = PORTAL_YEAR_MAX): number[] {
  const from = Math.min(start, end);
  const to = Math.max(start, end);
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export function portalYearSelectOptions(
  start = PORTAL_YEAR_MIN,
  end = PORTAL_YEAR_MAX,
): { key: string; value: string }[] {
  return portalYears(start, end).map((year) => ({ key: String(year), value: String(year) }));
}
