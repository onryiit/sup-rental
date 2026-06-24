import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Init tamamlandıysa direkt kontrol et, değilse bekle
  if (auth.isReady) {
    return auth.isLoggedIn ? true : router.createUrlTree(['/login']);
  }

  return auth.ready$.pipe(
    filter(ready => ready),
    switchMap(() => of(auth.isLoggedIn ? true : router.createUrlTree(['/login'])))
  );
};
