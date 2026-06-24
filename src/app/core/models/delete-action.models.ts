export interface DeleteActionResult {
  action: 'deleted' | 'pending_approval';
  message?: string;
  requestId?: string;
  status?: string;
}

export interface DeleteActionBody {
  reason?: string;
}
