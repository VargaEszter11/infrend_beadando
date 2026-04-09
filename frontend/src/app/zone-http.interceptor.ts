import { HttpInterceptorFn } from '@angular/common/http';
import { ApplicationRef, inject, NgZone } from '@angular/core';
import { finalize } from 'rxjs';

/**
 * Forces an application CD cycle after each HTTP request completes so UI updates
 * from subscribe callbacks are visible on the first interaction (Zone + Http timing).
 */
export const zoneHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const appRef = inject(ApplicationRef);
  const ngZone = inject(NgZone);
  return next(req).pipe(
    finalize(() => {
      ngZone.run(() => {
        appRef.tick();
      });
    }),
  );
};
