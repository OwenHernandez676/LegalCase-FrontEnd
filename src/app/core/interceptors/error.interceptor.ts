import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../store/auth.store';

/** Manejo centralizado de errores HTTP: cierra sesión ante 401. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        auth.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
