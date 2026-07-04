export interface ToastData {
  message: string;
  variant: 'success' | 'error' | 'quickError';
  helptext?: string;
  durationMs?: number;
}
