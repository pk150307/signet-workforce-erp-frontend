import * as dayjs from 'dayjs';

export interface DatePickerPayload {
  showTimeFields?: boolean;
  selectedDate?: dayjs.Dayjs;
  outputFormat: string;
  maxDate?: dayjs.Dayjs | string;
  minDate?: dayjs.Dayjs | string;
  title?: string;
  onSave(selectedDate: dayjs.Dayjs, formattedDate: string): void;
  hideBackdrop?: boolean;
}