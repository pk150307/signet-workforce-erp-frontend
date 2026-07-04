<signet-date-input-field *ngIf="config.filters[1] && config.filters[1].type == FilterType.DATE_RANGE" [config]="config.filters[1].dateConfig"  [isRangePicker]="true" [(value)]="config.filters[1].value" [defaultValue]="config.filters[1].default" [showError]="false" 
    [placeholder]="config.filters[1].placeholder ?? 'Select Date Range'">
</signet-date-input-field>