export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  visible?: boolean;
  route?: string | any[];
  queryParams?: Record<string, unknown>;
  data?: unknown;
  description?: string;
  meta?: string;
}
