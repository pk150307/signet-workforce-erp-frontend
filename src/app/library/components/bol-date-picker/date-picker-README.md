<signet-date-input-field *ngIf="config.filters[0] && config.filters[0].type == FilterType.DATE" [fieldTitle]="'From'"
    [config]="config.filter[0].dateConfig" [(value)]="config.filters[0].value" [defaultValue]="config.filters[0].default"
    [placeholder]="config.filters[0].placeholder ?? 'Select Date'">
</signet-date-input-field>
