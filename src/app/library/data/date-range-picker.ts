import { Dayjs } from 'dayjs';

export interface DateRangePicker {
  showTimeFields?: boolean;
  selectedStartDate?: Dayjs;
  selectedEndDate?: Dayjs;
  maxDate?: Dayjs | string;
  minDate?: Dayjs | string;
  outputFormat: string;
  allowSingleDateSelection: boolean;
  title?: string;
  description?: string;
  saveText?: string;
  customFutureSelection?:boolean;
  customFutureSectionPeriod?:any;
  customFutureSectionValue?:number;
  validateSelection?: (
    startDate: Dayjs,
    endDate?: Dayjs
  ) => string | undefined | null;
  onSave(
    startDate: Dayjs,
    endDate: Dayjs | undefined,
    formattedDate: (string | undefined)[]
  ): void;
  hideBackdrop?: boolean;
  positionChange?: boolean;
}
