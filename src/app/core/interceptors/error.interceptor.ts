import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRoute = req.url.includes('/auth/');
      if (error.status === 401 && !isAuthRoute && !authService.isLoggingOut()) {
        authService.logout();
      } else if (error.status === 403) {
        notificationService.error('Access denied. You do not have permission.');
      } else if (error.status === 0) {
        notificationService.error('Unable to connect to server. Please check your connection.');
      } else if (error.status >= 500) {
        notificationService.error('A server error occurred. Please try again later.');
      }
      return throwError(() => error);
    })
  );
};
