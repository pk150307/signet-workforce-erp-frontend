import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePickerPayload } from '../../data/date-picker-payload';
import { DateRangePicker } from '../../data/date-range-picker';
import { SharedService } from '../../../shared/shared.service';
import dayjs from "dayjs";
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { resolveFieldPlaceholder } from '../../utils/field-placeholder.util';
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone);

@Component({
  selector: 'signet-date-input-field',
  templateUrl: './date-input-field.component.html',
  styleUrl: './date-input-field.component.less',
})
export class DateInputFieldComponent {
  calendarRef: any;
  @Input() systemFormat: string = 'YYYY-MM-DDTHH:mm:ss';
  @Input() value: { startDate?: string; endDate?: string } = {};
  @Input() fieldTitle?: string;
  @Input() placeholder: string = '';
  @Input() defaultValue: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() config?: Partial<DatePickerPayload | DateRangePicker>;
  @Input() isRangePicker: boolean = false;
  @Input() width: number = 100;
  @Input() widthUnit: 'px' | '%' | 'rem' | 'em' = '%';
  @Input() showError: boolean = true;
  @Input() highlightOnFocus: string = '';
  @Input() autofocusField: boolean = false;
  @Input() defaultFocus: boolean = false;
  @Output() valueChange = new EventEmitter<{
    startDate?: string;
    endDate?: string;
  }>();

  @Input() errorMessage: string | undefined;
  @Input() toolTipMessage: string | undefined;
  @Input() includeErrorMsgPaddingFlag: boolean = true;
  @Input() tooltipWidth: number | undefined;
  @Input() tooltipHeight: number | undefined;
  @Input() readOnly: boolean = false;
  @Input() disableFieldOnly: boolean = false;
  constructor(private sharedService: SharedService) {}

  get currentTimeZone() {
    return this.sharedService.programTimeZone;
  }
  get currentDateFormat() {
    return this.config?.showTimeFields
      ? DateTimeHelper.dateTimeFormat
      : DateTimeHelper.dateFormat;
  }

  ngOnInit(): void {
    dayjs.tz.setDefault(this.currentTimeZone);
  }

  openPicker() {
    if (this.calendarRef) {
      this.calendarRef.close();
    }
    if (this.isRangePicker) {
      const payload = this.dateRangePickerConfig;
      this.calendarRef = this.sharedService.openDateRangePicker(payload);
    } else {
      const payload = this.datePickerConfig;
      this.calendarRef = this.sharedService.openDatePicker(payload);
    }
  }

  get datePickerConfig(): DatePickerPayload {
    let startDate;
    if (this.value?.startDate) {
      if (this.systemFormat.includes('Z')) {
        startDate = dayjs(this.value.startDate, this.systemFormat);
      } else {
        startDate = dayjs.tz(
          this.value.startDate,
          this.systemFormat,
          this.currentTimeZone
        );
      }
    }
    return {
      outputFormat: 'YYYY-MM-DD',
      ...this.config,
      selectedDate: startDate,
      onSave: (selectedDate: dayjs.Dayjs, formattedDate: string) => {
        this.value = {
          startDate: selectedDate.tz().format(this.systemFormat),
          endDate: undefined,
        };
        if (this.config?.onSave) {
          (this.config.onSave as any)(selectedDate, formattedDate);
        }
        this.valueChange.emit({ ...this.value });
      },
    };
  }
  get dateRangePickerConfig(): DateRangePicker {
    let startDate;
    if (this.value?.startDate && this.value?.startDate.length > 0) {
      if (this.systemFormat.includes('Z')) {
        startDate = dayjs(this.value.startDate, this.systemFormat);
      } else {
        startDate = dayjs.tz(
          this.value.startDate,
          this.systemFormat,
          this.currentTimeZone
        );
      }
    }
    let endDate;
    if (this.value?.endDate && this.value?.endDate.length > 0) {
      if (this.systemFormat.includes('Z')) {
        endDate = dayjs(this.value.endDate, this.systemFormat);
      } else {
        endDate = dayjs.tz(
          this.value.endDate,
          this.systemFormat,
          this.currentTimeZone
        );
      }
    }
    let headTitle = this.config?.title;
    if (this.fieldTitle === 'Validity Timeframe') {
      headTitle = 'Select ' + this.fieldTitle;
    }
    if (
      this.fieldTitle === 'Product Validity' ||
      this.fieldTitle === 'Reward & Award Validity' ||
      this.fieldTitle === 'Award Validity'
    ) {
      headTitle = 'Select Product Validity';
    }
    return {
      outputFormat: 'YYYY-MM-DD',
      allowSingleDateSelection: false,
      ...this.config,
      selectedStartDate: startDate,
      selectedEndDate: endDate,
      title: headTitle,
      onSave: (
        startDate: dayjs.Dayjs,
        endDate: dayjs.Dayjs | undefined,
        formattedDate: (string | undefined)[]
      ) => {
        this.value = {
          startDate: startDate.tz().format(this.systemFormat),
          endDate: undefined,
        };
        if (endDate) {
          this.value.endDate = endDate.tz().format(this.systemFormat);
        }
        this.valueChange.emit({ ...this.value });
      },
    };
  }
  get display(): string {
    let displayValue = this.defaultValue;
    try {
      if (this.value?.startDate && this.value?.startDate.length > 0) {
        if (this.systemFormat.includes('Z')) {
          displayValue = dayjs(this.value.startDate, this.systemFormat)
            .tz()
            .format(this.currentDateFormat ?? 'YYYY-MM-DD');
        } else {
          displayValue = dayjs
            .tz(this.value.startDate, this.systemFormat, this.currentTimeZone)
            .tz()
            .format(this.currentDateFormat ?? 'YYYY-MM-DD');
        }
      }
      if (this.value?.endDate && this.value?.endDate.length > 0) {
        if (this.systemFormat.includes('Z')) {
          displayValue +=
            ' - ' +
            dayjs(this.value.endDate, this.systemFormat)
              .tz()
              .format(this.currentDateFormat ?? 'YYYY-MM-DD');
        } else {
          displayValue +=
            ' - ' +
            dayjs
              .tz(this.value.endDate, this.systemFormat, this.currentTimeZone)
              .tz()
              .format(this.currentDateFormat ?? 'YYYY-MM-DD');
        }
      }
    } catch (error) {
      displayValue = this.defaultValue;
    }
    return displayValue;
  }

  get resolvedPlaceholder(): string {
    return resolveFieldPlaceholder(this.fieldTitle, this.placeholder, 'select');
  }
}
