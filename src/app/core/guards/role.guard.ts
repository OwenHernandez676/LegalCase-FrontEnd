import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { Role } from '../models';

/**
 * Guard de autorización por rol (RBAC).
 * Uso: canActivate: [roleGuard(['administrador'])]
 */
export const roleGuard = (allowed: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    const role = auth.role();
    if (role && allowed.includes(role)) return true;
    return router.createUrlTree(['/app/dashboard']);
  };
};
