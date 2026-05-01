import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase';

export const authGuard: CanActivateFn = (_route, state) => {
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);

  if (firebaseService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url },
  });
};
