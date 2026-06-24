import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '@env/environment';
import { EmployeeDocument, EmployeeDocumentType } from '../models/employee.models';

export interface SignedDownloadResponse {
  url: string;
  fileName?: string;
  expiresInSeconds: number;
  source: 's3' | 'disk';
}

@Injectable({ providedIn: 'root' })
export class EmployeeDocumentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  getAll(employeeId: string): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.base}/${employeeId}/documents`);
  }

  upload(employeeId: string, type: EmployeeDocumentType, file: File, label?: string): Observable<EmployeeDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (label) formData.append('label', label);

    return this.http.post<EmployeeDocument>(`${this.base}/${employeeId}/documents`, formData);
  }

  /** Request a short-lived signed URL from the backend (private S3 bucket). */
  getSignedDownloadUrl(
    employeeId: string,
    documentId: string,
    inline = false,
  ): Observable<SignedDownloadResponse> {
    let params = new HttpParams();
    if (inline) {
      params = params.set('inline', 'true');
    }

    return this.http.get<SignedDownloadResponse>(
      `${this.base}/${employeeId}/documents/${documentId}/download`,
      { params },
    );
  }

  getProfilePhotoSignedUrl(employeeId: string): Observable<string> {
    return this.http
      .get<SignedDownloadResponse>(`${this.base}/${employeeId}/photo/download`, {
        params: { inline: 'true' },
      })
      .pipe(map((res) => res.url));
  }

  downloadToFile(employeeId: string, document: EmployeeDocument): Observable<void> {
    return this.getSignedDownloadUrl(employeeId, document.id).pipe(
      tap((res) => this.triggerDownload(res.url, document.fileName)),
      map(() => undefined),
    );
  }

  openInNewTab(employeeId: string, document: EmployeeDocument): Observable<void> {
    return this.getSignedDownloadUrl(employeeId, document.id, true).pipe(
      tap((res) => window.open(res.url, '_blank', 'noopener,noreferrer')),
      map(() => undefined),
    );
  }

  delete(employeeId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${employeeId}/documents/${documentId}`);
  }

  private triggerDownload(url: string, fileName: string): void {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.click();
  }
}
