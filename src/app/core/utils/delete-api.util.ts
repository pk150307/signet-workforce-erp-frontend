import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DeleteActionBody, DeleteActionResult } from '../models/delete-action.models';

export function mapDeleteResponse(
  response: HttpResponse<DeleteActionResult | null>,
): DeleteActionResult {
  if (response.status === 202) {
    const body = response.body;
    return {
      action: 'pending_approval',
      message: body?.message ?? 'Delete request submitted for approval.',
      requestId: body?.requestId,
      status: body?.status ?? 'pending',
    };
  }

  return { action: 'deleted' };
}

export function deleteWithApproval(
  http: HttpClient,
  url: string,
  body?: DeleteActionBody,
): Observable<DeleteActionResult> {
  return http
    .delete<DeleteActionResult | null>(url, {
      body: body?.reason ? { reason: body.reason } : undefined,
      observe: 'response',
    })
    .pipe(map(mapDeleteResponse));
}
