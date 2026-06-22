import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { parseApiDate } from '../../core/utils/api-response.util';

@Pipe({ name: 'safeDate', standalone: true })
export class SafeDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-GB');

  transform(value: unknown, format = 'dd MMM yyyy'): string {
    const parsed = parseApiDate(value);
    if (!parsed) return '—';
    return this.datePipe.transform(parsed, format) ?? '—';
  }
}
