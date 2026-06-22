import { Pipe, PipeTransform } from '@angular/core';
import { formatApiDate } from '../../core/utils/api-response.util';

@Pipe({ name: 'apiDate', standalone: true })
export class ApiDatePipe implements PipeTransform {
  transform(value: unknown, format: 'short' | 'medium' | 'long' = 'medium'): string {
    return formatApiDate(value, format);
  }
}
