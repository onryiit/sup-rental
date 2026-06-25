import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isAuthRoute = req.url.includes('/auth/');
  const token = isAuthRoute ? null : auth.bearerToken;
  const authed = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthRoute && !refreshing) {
        refreshing = true;
        return auth.refresh().pipe(
          switchMap(() => {
            refreshing = false;
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${auth.bearerToken}` },
            });
            return next(retried);
          }),
          catchError(() => {
            refreshing = false;
            auth.logout();
            return EMPTY;
          })
        );
      }
      return throwError(() => err);
    })
  );
};
