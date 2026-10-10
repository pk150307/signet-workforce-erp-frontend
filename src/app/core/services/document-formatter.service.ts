import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DocumentFormatterPreview } from '../models/document-formatter.models';

@Injectable({ providedIn: 'root' })
export class DocumentFormatterService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/document-formatter`;

  preview(clientId: string, file: File): Observable<DocumentFormatterPreview> {
    return this.http.post<DocumentFormatterPreview>(`${this.base}/attendance/preview`, this.form(file), {
      params: new HttpParams().set('clientId', clientId),
    });
  }

  exportWorkbook(clientId: string, file: File, month: number, year: number) {
    const params = new HttpParams()
      .set('clientId', clientId)
      .set('month', String(month))
      .set('year', String(year));
    return this.http.post(`${this.base}/attendance/export`, this.form(file), {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

  private form(file: File): FormData {
    const form = new FormData();
    form.append('file', file);
    return form;
  }
}
