import { Component } from '@angular/core';
import dayjs from 'dayjs';
import { LocaleConfig } from 'ngx-daterangepicker-material';
import { DatePickerPayload } from '../../data/date-picker-payload';
import { MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedService } from '../../../shared/shared.service';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Dayjs } from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

@Component({
  selector: 'signet-date-picker',
  templateUrl: './bol-date-picker.component.html',
  styleUrl: './bol-date-picker.component.less',
})
export class BolDatePickerComponent {
  setIntervalListener: any;
  title: string;
  showTimeFields: boolean = true;
  selectedDate: dayjs.Dayjs;
  maxDate!: string;
  minDate!: string;
  outputFormat: string;
  minutes: string = '00';
  seconds: string = '00';
  hours: string = '00';
  currentSelection: dayjs.Dayjs;
  onSave: Function;
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
    daysOfWeek: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'],
    firstDay: 1,
  };
  selectedTimeRange: 'AM' | 'PM' = 'AM';
  constructor(
    public dialogRef: MatDialogRef<BolDatePickerComponent>,
    @Inject(MAT_DIALOG_DATA) payload: DatePickerPayload,
    private sharedService: SharedService
  ) {
    dayjs.tz.setDefault(sharedService.programTimeZone);
    this.showTimeFields = payload.showTimeFields ?? true;
    this.mapMinMaxDate(payload.maxDate, payload.minDate);
    this.selectedDate = this.handleDateTime(payload.selectedDate ?? dayjs());
    this.outputFormat = payload.outputFormat ?? '';
    this.onSave = payload.onSave;
    this.currentSelection = this.selectedDate;
    this.title = payload.title ?? 'Calendar';
    if (payload.selectedDate && payload.showTimeFields) {
      this.minutes = this.selectedDate.format('mm');
      this.seconds = this.selectedDate.format('ss');
      this.hours = this.selectedDate.format('hh');
      this.selectedTimeRange = this.selectedDate.format('A') as 'AM' | 'PM';
    }

    this.setIntervalListener = setInterval(() => {
      this.hidedisablerow();
    }, 10);
  }
  @ViewChild('datepicker') datepicker: ElementRef | undefined;
  ngAfterViewInit(): void {
    if (this.datepicker) {
      this.accessChildElement();
    }
  }
  private accessChildElement(): void {
    const datepickerElement = this.datepicker?.nativeElement;
    const childElement = datepickerElement.querySelectorAll('.available');
    const monthDropdown = datepickerElement.querySelectorAll('.monthselect');
    const yearDropdown = datepickerElement.querySelectorAll('.yearselect');
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

  validateTime(value: any, type: 'hours' | 'minutes' | 'seconds') {
    if (isNaN(value)) {
      return;
    }

    let num = parseInt(value, 10);

    switch (type) {
      case 'hours':
        if (num > 12) num = 12;
        else if (num <= 0) num = 1;
        this.hours = num.toString().padStart(2, '0');
        break;

      case 'minutes':
      case 'seconds':
        if (num > 59) num = 59;
        else if (num < 0) num = 0;
        if (type === 'minutes') {
          this.minutes = num.toString().padStart(2, '0');
        } else {
          this.seconds = num.toString().padStart(2, '0');
        }
        break;
    }
  }

  handleDateTime(date: Dayjs) {
    return dayjs(
      date.tz().format('YYYY-MM-DDTHH:mm:ss'),
      'YYYY-MM-DDTHH:mm:ss'
    );
  }

  hidedisablerow() {
    const tableRows = document.querySelectorAll('tbody tr');

    // Loop through each table row
    tableRows.forEach((row) => {
      (row as HTMLTableRowElement).style.display = 'flex';
      // Check if the row contains any table cells with the "off" class
      const hasOffCells = Array.from(row.querySelectorAll('td')).every(
        (cell) =>
          cell.classList.contains('off') && cell.classList.contains('available')
      );

      // If any cell in the row has the "off" class, hide the entire row
      if (hasOffCells) {
        (row as HTMLTableRowElement).style.display = 'none';
      }
    });
  }

  closeCalendar() {
    this.dialogRef.close();
  }
  toggleTimeRange(range: 'AM' | 'PM') {
    this.selectedTimeRange = range;
  }
  updateDate(selection: any) {
    this.currentSelection = selection.startDate;
  }
  saveDate() {
    if (this.showTimeFields) {
      let hourNum = parseInt(this.hours, 10);

      if (this.selectedTimeRange === 'AM' && hourNum === 12) {
        hourNum = 0;
      } else if (this.selectedTimeRange === 'PM' && hourNum !== 12) {
        hourNum = 12 + hourNum;
      }

      this.currentSelection = this.currentSelection
        .set('hour', hourNum)
        .set('minute', parseInt(this.minutes, 10))
        .set('second', parseInt(this.seconds, 10));
    }

    const value = this.currentSelection.format('YYYY-MM-DDTHH:mm:ss');
    const outputDate = dayjs.tz(
      value,
      'YYYY-MM-DDTHH:mm:ss',
      this.sharedService.programTimeZone
    );
    const formattedDate = outputDate.tz().format(this.outputFormat);

    if (this.onSave) {
      this.onSave(outputDate, formattedDate);
    }
    this.closeCalendar();
  }
  CancelDate() {
    this.closeCalendar();
  }

  mapMinMaxDate(
    maxDate?: dayjs.Dayjs | string,
    minDate?: dayjs.Dayjs | string
  ) {
    if (maxDate) {
      this.maxDate = maxDate.toString();
      if (this.selectedDate == null) {
        this.hours = dayjs(this.maxDate).tz().format('hh');
        this.minutes = dayjs(this.maxDate).tz().format('mm');
        this.seconds = dayjs(this.maxDate).tz().format('ss');
        this.toggleTimeRange(
          dayjs(this.maxDate).tz().format('A') as 'AM' | 'PM'
        );
      }
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

  ngOnDestroy(): void {
    if (this.setIntervalListener) {
      clearInterval(this.setIntervalListener);
    }
  }
  get selectedDateRange() {
    return {
      startDate: this.selectedDate,
      endDate: this.selectedDate,
    };
  }
}
