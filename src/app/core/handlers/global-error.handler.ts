import { ErrorHandler, Injectable } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly notification: NotificationService) {}

  handleError(error: Error): void {
    console.error('Global Error Handler:', error);

    // Show user-friendly error message
    const message = this.getUserFriendlyMessage(error);
    this.notification.error(message);

    // Log to external service in production
    if (typeof window !== 'undefined' && (window as any).logErrorToService) {
      (window as any).logErrorToService(error);
    }
  }

  private getUserFriendlyMessage(error: Error): string {
    if (error.message.includes('ChunkLoadError')) {
      return 'Network error. Please check your connection and refresh.';
    }
    if (error.message.includes('401') || error.message.includes('403')) {
      return 'Authentication error. Please log in again.';
    }
    if (error.message.includes('404')) {
      return 'Resource not found. Please refresh the page.';
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
