import { DatePickerPayload } from './date-picker-payload';

export type SuperFilterConfig = {
  filters: Filter[];
  sort?: Filter;
};
export interface Filter {
  type: FilterDataType;
  default: any;
  showDefault?: any;
  value?: any;
  filterKey: string;
  displayName: string;
  options?: { key: any; value: any }[];
  placeholder?: string;
  dateConfig?: DatePickerPayload;
  searchSelectConfig?: {
    showPrefixOptionIcon?: boolean;
  };
  multiSelectConfig?: {
    showAll?: boolean;
    allText?: string;
    selectAll?: boolean;
  };
}
export enum FilterDataType {
  DATE,
  DATE_RANGE,
  SELECT,
  MULTI_SELECT,
  TEXT,
  NUMBER,
  FACETS_ACTION,
  RADIO,
}
