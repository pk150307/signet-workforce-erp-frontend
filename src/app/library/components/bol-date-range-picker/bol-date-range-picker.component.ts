import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { LocaleConfig } from 'ngx-daterangepicker-material';
import { DateRangePicker } from '../../data/date-range-picker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from '../../../shared/shared.service';

@Component({
  selector: 'signet-date-range-picker',
  templateUrl: './bol-date-range-picker.component.html',
  styleUrl: './bol-date-range-picker.component.less',
})
export class BolDateRangePickerComponent {
  showTimeFields: boolean = true;
  selectedStartDate: Dayjs | undefined;
  selectedEndDate: Dayjs | undefined;
  startDate: Dayjs;
  endDate: Dayjs;
  customFutureSelection: boolean = false;
  customFutureSectionPeriod!: any;
  customFutureSectionValue!: number;
  maxDate!: string;
  minDate!: string;
  outputFormat: string;
  minutes: string[] = ['00', '59'];
  hours: string[] = ['12', '11'];
  seconds: string[] = ['00', '59'];
  onSave: Function;
  allowSingleDateSelection: boolean = false;
  localeConfing: LocaleConfig = {
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    daysOfWeek: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
    firstDay: 1,
  };
  selectedTimeRange: ('AM' | 'PM')[] = ['AM', 'PM'];
  errorMessage?: string = '';
  customValidator?: Function;
  payload: DateRangePicker;
  defaultSaveValue: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<BolDateRangePickerComponent>,
    @Inject(MAT_DIALOG_DATA) payload: DateRangePicker,
    private sharedService: SharedService
  ) {
    dayjs.tz.setDefault(this.sharedService.programTimeZone);
    this.payload = payload;
    this.allowSingleDateSelection = payload?.allowSingleDateSelection ?? false;
    this.showTimeFields = true;
    this.selectedStartDate = payload.selectedStartDate ?? dayjs();
    this.selectedEndDate = payload.selectedEndDate ?? dayjs();
    this.outputFormat = payload?.outputFormat ?? '';
    this.customFutureSelection = payload?.customFutureSelection ?? false;
    this.customFutureSectionPeriod = payload?.customFutureSectionPeriod ?? '';
    this.customFutureSectionValue = payload?.customFutureSectionValue ?? 0;
    this.onSave = payload?.onSave;
    this.customValidator = payload.validateSelection;
    this.startDate = this.handleDateTime(this.selectedStartDate ?? dayjs());
    this.endDate = this.handleDateTime(
      this.selectedEndDate ?? this.selectedStartDate ?? dayjs()
    );
    this.mapMinMaxDate(payload.maxDate, payload.minDate);
    if (payload.selectedStartDate || this.showTimeFields) {
      this.mapSelectedDate(this.startDate, 0);
    }
    if (payload.selectedEndDate) {
      this.mapSelectedDate(this.endDate, 1);
    }
  }

  @ViewChild('daterangepicker') daterangepicker: ElementRef | undefined;

  ngAfterViewInit(): void {
    if (this.daterangepicker) {
      this.accessChildElement();
    }
  }

  private accessChildElement(): void {
    const daterangepickerElement = this.daterangepicker?.nativeElement;
    const childElement = daterangepickerElement.querySelectorAll('.available');
    const monthDropdown =
      daterangepickerElement.querySelectorAll('.monthselect');
    const yearDropdown = daterangepickerElement.querySelectorAll('.yearselect');
    monthDropdown.forEach((element: HTMLElement) => {
      element.setAttribute('aria-label', 'Select Month');
    });
    yearDropdown.forEach((element: HTMLElement) => {
      element.setAttribute('aria-label', 'Select Year');
    });
    if (childElement) {
      childElement.forEach((element: HTMLElement) => {
        if (!element.classList.contains('off')) {
          (element as HTMLElement).tabIndex = 0;
          const spanElement = element.querySelector('span');
          if (spanElement) {
            const labelText: any = spanElement.textContent;
            element.setAttribute('role', 'button');
            element.setAttribute('aria-label', labelText);
          }
        }
      });
    }
  }

  handleDateTime(date: Dayjs) {
    return dayjs(
      date.tz().format('YYYY-MM-DDTHH:mm:ss'),
      'YYYY-MM-DDTHH:mm:ss'
    );
  }

  mapMinMaxDate(
    maxDate?: dayjs.Dayjs | string,
    minDate?: dayjs.Dayjs | string
  ) {
    if (maxDate) {
      this.maxDate = maxDate.toString();
    } else {
      this.maxDate = dayjs()
        .set('year', 2500)
        .set('date', 31)
        .set('month', 11)
        .toString();
    }
    if (minDate) {
      this.minDate = minDate.toString();
    } else {
      this.minDate = dayjs()
        .set('year', 1910)
        .set('date', 1)
        .set('month', 0)
        .toString();
    }
  }

  mapSelectedDate(date: dayjs.Dayjs, type: 0 | 1) {
    if (this.showTimeFields) {
      this.minutes[type] = date.format('mm');
      this.hours[type] = date.format('hh');
      this.selectedTimeRange[type] = date.format('A') as 'AM' | 'PM';
    }
  }

  toggleTimeRange(range: 'AM' | 'PM', selectionType: number) {
    this.selectedTimeRange[selectionType] = range;
  }

  validateTime(
    value: any,
    type: 'hours' | 'minutes' | 'seconds',
    index: number
  ) {
    if (isNaN(value)) {
      return;
    }
    let num = parseInt(value, 10);
    switch (type) {
      case 'hours':
        if (num > 12) num = 12;
        else if (num <= 0) num = 1;
        this.hours[index] = num.toString().padStart(2, '0');
        break;

      case 'minutes':
      case 'seconds':
        if (num > 59) num = 59;
        else if (num < 0) num = 0;
        if (type === 'minutes') {
          this.minutes[index] = num.toString().padStart(2, '0');
        } else {
          this.seconds[index] = num.toString().padStart(2, '0');
        }
        break;
    }
  }

  isValidDateSelection(startDate: any, endDate: any): boolean {
    startDate = dayjs(startDate, this.outputFormat);
    endDate = dayjs(endDate, this.outputFormat);
    if (this.showTimeFields) {
      return startDate.isBefore(endDate);
    }
    let isAfter = startDate.isAfter(endDate);
    return !isAfter;
  }

  onEndDateSelected(event: any) {
    this.selectedEndDate = event.endDate;
  }

  saveDate() {
    this.errorMessage = '';
    let outputStartDate = this.selectedStartDate;
    let outputEndDate = this.selectedEndDate;

    if (!outputStartDate) {
      const currentDate = dayjs();
      this.defaultSaveValue = true;
      outputEndDate = currentDate.endOf('day');
      outputStartDate = currentDate.startOf('day');
    }

    if (this.allowSingleDateSelection) {
      if (!outputStartDate) {
        this.errorMessage = 'Start date is required.';
        return;
      }
    } else {
      if (!outputStartDate || !outputEndDate) {
        this.errorMessage = 'Start date and end date is required.';
        return;
      }
    }

    if (this.showTimeFields) {
      // --- Start Hour ---
      let startHour: number = parseInt(this.hours[0], 10);
      if (this.selectedTimeRange[0] === 'AM' && startHour >= 12) {
        startHour -= 12;
      } else if (this.selectedTimeRange[0] === 'PM' && startHour < 12) {
        startHour += 12;
      }
      outputStartDate = outputStartDate.set(
        'minute',
        parseInt(this.minutes[0])
      );
      outputStartDate = outputStartDate.set('hour', startHour).set('second', 0);

      const valueStart = outputStartDate.format('YYYY-MM-DDTHH:mm:ss');
      outputStartDate = dayjs.tz(
        valueStart,
        'YYYY-MM-DDTHH:mm:ss',
        this.sharedService.programTimeZone
      );

      // --- End Hour ---
      if (outputEndDate) {
        let endHour: number = parseInt(this.hours[1], 10);
        if (this.selectedTimeRange[1] === 'AM' && endHour >= 12) {
          endHour -= 12;
        } else if (this.selectedTimeRange[1] === 'PM' && endHour < 12) {
          endHour += 12;
        }
        outputEndDate = outputEndDate.set('minute', parseInt(this.minutes[1]));
        outputEndDate = outputEndDate.set('hour', endHour).set('second', 0);

        const valueEnd = outputEndDate.format('YYYY-MM-DDTHH:mm:ss');
        outputEndDate = dayjs.tz(
          valueEnd,
          'YYYY-MM-DDTHH:mm:ss',
          this.sharedService.programTimeZone
        );
      }
    }

    if (outputStartDate) {
      const value = outputStartDate.format('YYYY-MM-DDTHH:mm:ss');
      outputStartDate = dayjs.tz(
        value,
        'YYYY-MM-DDTHH:mm:ss',
        this.sharedService.programTimeZone
      );
    }
    if (outputEndDate) {
      const value = outputEndDate.format('YYYY-MM-DDTHH:mm:ss');
      outputEndDate = dayjs.tz(
        value,
        'YYYY-MM-DDTHH:mm:ss',
        this.sharedService.programTimeZone
      );
    }

    if (this.customValidator) {
      this.errorMessage = this.customValidator(outputStartDate, outputEndDate);
      if (this.errorMessage) {
        return;
      }
    }

    let formattedOutput: (undefined | string)[] = [undefined, undefined];
    formattedOutput[0] = outputStartDate.tz().format(this.outputFormat);
    if (outputEndDate) {
      formattedOutput[1] = outputEndDate.tz().format(this.outputFormat);
    }

    if (
      this.allowSingleDateSelection &&
      outputEndDate &&
      !this.isValidDateSelection(formattedOutput[0], formattedOutput[1])
    ) {
      this.errorMessage = 'Invalid date range selection.';
      return;
    }
    this.onSave(outputStartDate, outputEndDate, formattedOutput);
    this.closeCalendar();
  }

  onStartDateSelected(event: any) {
    this.selectedStartDate = event.startDate;
    this.selectedEndDate = undefined;
    if (this.customFutureSelection) {
      this.maxDate = dayjs(this.selectedStartDate)
        .add(this.customFutureSectionValue, this.customFutureSectionPeriod)
        .toString();
    }
  }

  getDisabledCondition() {
    if (!this.allowSingleDateSelection) {
      if (!this.selectedStartDate && !this.selectedEndDate) {
        return false;
      }
      if (!this.selectedEndDate && this.selectedStartDate) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  }

  closeCalendar() {
    this.dialogRef.close();
  }
  get getSelectedDate() {
    if (this.selectedEndDate) {
      return `${dayjs(this.selectedStartDate).format('MMM, YYYY')} - ${dayjs(
        this.selectedEndDate
      ).format('MMM, YYYY')}`;
    } else {
      return dayjs(this.selectedStartDate).format('MMM, YYYY');
    }
  }
}
