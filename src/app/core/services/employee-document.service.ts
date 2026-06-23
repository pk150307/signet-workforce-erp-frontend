import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { EmployeeDocument, EmployeeDocumentType } from '../models/employee.models';

@Injectable({ providedIn: 'root' })
export class EmployeeDocumentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  getAll(employeeId: string): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.base}/${employeeId}/documents`).pipe(
      catchError(() => of([])),
    );
  }

  upload(employeeId: string, type: EmployeeDocumentType, file: File, label?: string): Observable<EmployeeDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (label) formData.append('label', label);

    return this.http.post<EmployeeDocument>(`${this.base}/${employeeId}/documents`, formData).pipe(
      catchError(() => of(this.createLocalDocument(type, file, label))),
    );
  }

  download(employeeId: string, document: EmployeeDocument, inline = false): Observable<Blob> {
    let params = new HttpParams();
    if (inline) {
      params = params.set('inline', 'true');
    }

    return this.http.get(`${this.base}/${employeeId}/documents/${document.id}/download`, {
      params,
      responseType: 'blob',
    }).pipe(
      switchMap(blob => this.ensureBlob(blob)),
    );
  }

  downloadToFile(employeeId: string, document: EmployeeDocument): Observable<void> {
    return this.download(employeeId, document).pipe(
      tap(blob => this.saveBlob(blob, document.fileName)),
      map(() => undefined),
    );
  }

  openInNewTab(employeeId: string, document: EmployeeDocument): Observable<void> {
    return this.download(employeeId, document, true).pipe(
      tap(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }),
      map(() => undefined),
    );
  }

  delete(employeeId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${employeeId}/documents/${documentId}`);
  }

  private ensureBlob(blob: Blob): Observable<Blob> {
    if (blob.type.includes('json')) {
      return from(blob.text()).pipe(
        switchMap(text => {
          try {
            const parsed = JSON.parse(text) as { title?: string; detail?: string };
            return throwError(() => new Error(parsed.detail ?? parsed.title ?? 'Download failed'));
          } catch {
            return throwError(() => new Error('Download failed'));
          }
        }),
      );
    }
    return of(blob);
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private createLocalDocument(type: EmployeeDocumentType, file: File, label?: string): EmployeeDocument {
    return {
      id: crypto.randomUUID(),
      type,
      label: label ?? file.name,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    };
  }
}
