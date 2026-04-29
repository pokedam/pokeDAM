import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = [
  '/auth/anonymous',
  '/auth/refresh'
];



export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('idToken');
  const injector = inject(Injector);

  // Si es endpoint público, no añadimos header
  if (PUBLIC_ENDPOINTS.some(url => req.url.includes(url))) {
    return next(req);
  }

  let firstReq = req;
  if (token) {
    firstReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(firstReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const authService = injector.get(AuthService);
        return authService.refreshTokens().pipe(
          switchMap((newToken) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
        );
      }
      return throwError(() => error);
    })
  );
};