import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing = false;

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.bearerToken;
    const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(authed).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !req.url.includes('/auth/') && !this.refreshing) {
          this.refreshing = true;
          return this.auth.refresh().pipe(
            switchMap(() => {
              this.refreshing = false;
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${this.auth.bearerToken}` },
              });
              return next.handle(retried);
            }),
            catchError(() => {
              this.refreshing = false;
              this.auth.logout();
              return EMPTY;
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
