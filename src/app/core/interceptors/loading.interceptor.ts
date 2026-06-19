import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

const SKIP_URLS = ['/auth/login', '/auth/refresh-token'];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const skip = SKIP_URLS.some(url => req.url.includes(url));

  if (!skip) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skip) {
        loadingService.hide();
      }
    })
  );
};
