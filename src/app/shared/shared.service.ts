import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { GlobalLoaderComponent } from '../library/components/global-loader/global-loader.component';
import { DatePickerPayload } from '../library/data/date-picker-payload';
import { DateRangePicker } from '../library/data/date-range-picker';
import { ToastData } from './models/toastData.interface';
import { BolDatePickerComponent } from '../library/components/bol-date-picker/bol-date-picker.component';
import { BolDateRangePickerComponent } from '../library/components/bol-date-range-picker/bol-date-range-picker.component';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private readonly _globalLoader = new BehaviorSubject<boolean>(false);
  private _globalLoaderRef?: MatDialogRef<GlobalLoaderComponent>;
  private readonly toastSubject = new ReplaySubject<ToastData>(1);
  toastState$ = this.toastSubject.asObservable();

  constructor(
    private matDialog: MatDialog,
    private http: HttpClient
  ) {}

  showToastMessage(
    message: string,
    variant: 'success' | 'error' | 'quickError' = 'success',
    helptext?: string,
    durationMs?: number
  ) {
    this.toastSubject.next({ message, variant, helptext, durationMs });
  }

  toggleGlobalLoader(show: boolean) {
    this._globalLoader.next(show);
    if (this._globalLoader.value && !this._globalLoaderRef) {
      this._globalLoaderRef = this.matDialog.open(GlobalLoaderComponent, {
        panelClass: ['hidable-panel'],
        hasBackdrop: true,
        disableClose: true,
        closeOnNavigation: false,
        exitAnimationDuration: '100ms',
        enterAnimationDuration: '200ms',
      });
    } else if (this._globalLoaderRef && !this._globalLoader.value) {
      this._globalLoaderRef.close();
      this._globalLoaderRef = undefined;
    }
  }

  openDatePicker(payload: DatePickerPayload) {
    const backdropClasses = ['signet-dialog-backdrop', 'datepicker-dialog-backdrop', 'hidable-backdrop'];
    if (payload.hideBackdrop) {
      backdropClasses.push('datepicker-dialog-backdrop--hide');
    }
    return this.matDialog.open(BolDatePickerComponent, {
      backdropClass: backdropClasses,
      panelClass: ['signet-dialog-panel', 'datepicker-panel', 'hidable-panel'],
      width: '440px',
      data: payload,
      hasBackdrop: true,
      disableClose: true,
      ariaLabel: 'Date Picker',
    });
  }

  openDateRangePicker(payload: DateRangePicker) {
    const backdropClasses = ['signet-dialog-backdrop', 'datepicker-dialog-backdrop'];
    if (payload.hideBackdrop) {
      backdropClasses.push('datepicker-dialog-backdrop--hide');
    }
    const panelClasses = ['signet-dialog-panel', 'datepicker-panel'];
    if (payload.positionChange) {
      panelClasses.push('datepicker-panel--position-change');
    }
    return this.matDialog.open(BolDateRangePickerComponent, {
      backdropClass: backdropClasses,
      panelClass: panelClasses,
      width: '936px',
      data: payload,
      hasBackdrop: true,
      disableClose: true,
      ariaLabel: 'Date Range Picker',
    });
  }

  get programTimeZone(): string {
    return 'UTC';
  }

  get getCurrencyCode(): string {
    return 'INR';
  }

  get getdecimalPrecisionDisplay(): number {
    return 2;
  }

  get getFiscalYearStartMonth(): string {
    return 'Apr';
  }

  get getMonetaryCurrencySymbol() {
    return JSON.parse(localStorage.getItem('monetary_currency_symbol') ?? '"₹"');
  }

  formatNumber(val: string | number, type?: string): string {
    const decimal: number = this.getdecimalPrecisionDisplay;

    if (val === null || val === undefined || val === '') return '';

    const num = Number(val);
    if (isNaN(num)) return val.toString();

    if (type === 'COST_PER_POINT' || type === 'YIELD_PER_POINT') {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
      }).format(num);
    }

    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimal,
    }).format(num);
  }
}
