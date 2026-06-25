import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, switchMap, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const check = () => auth.isAdmin ? true : router.createUrlTree(['/home']);

  if (auth.isReady) return check();

  return auth.ready$.pipe(
    filter(ready => ready),
    switchMap(() => of(check()))
  );
};
