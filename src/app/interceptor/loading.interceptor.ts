import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { BusyService } from '../services/busy.service';  // Verify path
import { inject } from '@angular/core';  // This import fixes the 'inject' error

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  busyService.busy();  // Show spinner

  return next(req).pipe(
    finalize(() => busyService.idle())  // Hide spinner after request completes
  );
};