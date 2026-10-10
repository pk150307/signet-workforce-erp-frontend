export type FormatterRowStatus = 'matched' | 'unmatched' | 'duplicate' | 'invalid';

export interface DocumentFormatterPreviewRow {
  rowNumber: number;
  status: FormatterRowStatus;
  needsReview: boolean;
  message: string | null;
  sourceCode: string;
  sourceName: string;
  sourceFatherName: string;
  employeeId: string | null;
  employeeCode: string | null;
  employeeName: string | null;
  softCode: string | null;
  fatherName: string | null;
  presentDays: number | null;
  overtimeHours: number;
  nightAllowance: number;
  punctualityAward: number;
  bonus: number;
}

export interface DocumentFormatterPreview {
  clientId: string;
  clientName: string;
  detectedMonth: number | null;
  detectedYear: number | null;
  monthDays: number | null;
  summary: {
    sourceRows: number;
    matched: number;
    needsReview: number;
    unmatched: number;
    duplicates: number;
    invalid: number;
  };
  rows: DocumentFormatterPreviewRow[];
}
