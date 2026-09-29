export function downloadReportCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
): void {
  const escape = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((line) => line.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename.replace(/[^\w.-]+/g, '-')}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
