import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { EmployeeDocument, EmployeeDocumentType } from '../models/employee.models';

@Injectable({ providedIn: 'root' })
export class EmployeeDocumentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  getAll(employeeId: string): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.base}/${employeeId}/documents`).pipe(
      catchError(() => of([]))
    );
  }

  upload(employeeId: string, type: EmployeeDocumentType, file: File, label?: string): Observable<EmployeeDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (label) formData.append('label', label);

    return this.http.post<EmployeeDocument>(`${this.base}/${employeeId}/documents`, formData).pipe(
      catchError(() => of(this.createLocalDocument(type, file, label)))
    );
  }

  delete(employeeId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${employeeId}/documents/${documentId}`).pipe(
      catchError(() => of(undefined))
    );
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
