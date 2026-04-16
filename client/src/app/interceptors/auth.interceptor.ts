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

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
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
          catchError((refreshError) => {
            console.error('Token refresh failed: ', refreshError, ' Attemping annonymous login.');
            return authService.loginAnonymous().pipe(
              switchMap((newAnonymousToken) => {
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAnonymousToken}`
                  }
                });
                return next(retryReq);
              }),
              catchError((anonError) => {
                return throwError(() => anonError);
              })
            );
          })
        );
      }
      return throwError(() => error);
    })
  );
};