import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { result } from 'shared_types';

const PUBLIC_ENDPOINTS = [
  '/auth/anonymous',
  '/auth/refresh',
  '/auth/login',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (PUBLIC_ENDPOINTS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const storage = inject(StorageService);
  const token = storage.idToken;
  if (!token) throw Error("User not authenticated");

  let firstReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  const injector = inject(Injector);

  return next(firstReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const authService = injector.get(AuthService);
        return authService.refreshTokens().pipe(
          switchMap((auth) => next(req.clone({
            setHeaders: { Authorization: `Bearer ${auth.idToken}` },
          }))),
        );
      }
      return throwError(() => error);
    }),
  );
};