import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ActionMenuComponent } from './components/action-menu/action-menu.component';
import { ActionMenuTriggerDirective } from './components/action-menu/action-menu-trigger.directive';
import { ButtonComponent } from './components/button/button.component';
import { CustomTextFieldComponent } from './components/custom-text-field/custom-text-field.component';
import { CustomCheckboxComponent } from './components/custom-checkbox/custom-checkbox.component';
import { CustomTextAreaFieldComponent } from './components/custom-text-area-field/custom-text-area-field.component';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { DateInputFieldComponent } from './components/date-input-field/date-input-field.component';
import { BolDatePickerComponent } from './components/bol-date-picker/bol-date-picker.component';
import { BolDateRangePickerComponent } from './components/bol-date-range-picker/bol-date-range-picker.component';
import { LocaleService, NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SpacerComponent } from './components/spacer/spacer.component';
import { InfoTooltipComponent } from './components/info-tooltip/info-tooltip.component';
import { OtpFieldComponent } from './components/otp-field/otp-field.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { RadioInputComponent } from './components/radio-input/radio-input.component';
import { MatRadioModule } from '@angular/material/radio';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SearchSelectDropdownComponent } from './components/search-select-dropdown/search-select-dropdown.component';
import { SectionsNavigatorComponent } from './components/sections-navigator/sections-navigator.component';
import { StatusButtonComponent } from './components/status-button/status-button.component';
import { ToastNotificationComponent } from './components/toast-notification/toast-notification.component';
import { ToggleSwitchComponent } from './components/toggle-switch/toggle-switch.component';
import { UploadImageComponent } from './components/upload-image/upload-image.component';
import { MultiSelectDropdownComponent } from './components/multi-select-dropdown/multi-select-dropdown.component';



@NgModule({
  declarations: [
    ActionMenuComponent,
    ActionMenuTriggerDirective,
    ButtonComponent,
    CustomTextFieldComponent,
    CustomCheckboxComponent,
    CustomTextAreaFieldComponent,
    GlobalLoaderComponent,
    DateInputFieldComponent,
    BolDatePickerComponent,
    BolDateRangePickerComponent,
    SpacerComponent,
    InfoTooltipComponent,
    OtpFieldComponent,
    PaginationComponent,
    RadioInputComponent,
    SearchInputComponent,
    SearchSelectDropdownComponent,
    SectionsNavigatorComponent,
    StatusButtonComponent,
    ToastNotificationComponent,
    ToggleSwitchComponent,
    UploadImageComponent,
    MultiSelectDropdownComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatRadioModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  exports: [
    ActionMenuComponent,
    ActionMenuTriggerDirective,
    ButtonComponent,
    CustomTextFieldComponent,
    CustomCheckboxComponent,
    CustomTextAreaFieldComponent,
    GlobalLoaderComponent,
    DateInputFieldComponent,
    BolDatePickerComponent,
    BolDateRangePickerComponent,
    SpacerComponent,
    InfoTooltipComponent,
    OtpFieldComponent,
    PaginationComponent,
    RadioInputComponent,
    SearchInputComponent,
    SearchSelectDropdownComponent,
    SectionsNavigatorComponent,
    StatusButtonComponent,
    ToastNotificationComponent,
    ToggleSwitchComponent,
    UploadImageComponent,
    MultiSelectDropdownComponent
  ],
  providers: [LocaleService],
})
export class LibraryModule { }
