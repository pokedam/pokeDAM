import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, map, catchError, throwError, Observable, EMPTY, of } from 'rxjs';
import { ErrorService } from './error.service';
import shared, { authFactory, JwtAuth, LoginRequest, User, UserChangeRequest } from 'shared_types';
import { HttpService } from './http.service';
import { storage } from './storage.service';

export interface Auth {
  idToken: string,
  user: User,
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpService);
  //private errorService = inject(ErrorService);

  private authSubject = new BehaviorSubject<Auth | null>(null);
  public auth$ = this.authSubject.asObservable();

  public get avatarUrl(): string | null {
    const auth = this.authSubject.getValue();
    if (auth && auth.user.avatarId !== null) {
      return `assets/avatars/avatar${auth.user.avatarId}.png`;
    }
    return null;
  }

  public get auth(): Auth | null {
    return this.authSubject.getValue();
  }

  // constructor() {
  //   const idToken = localStorage.getItem('idToken');
  //   const refreshToken = localStorage.getItem('refreshToken');


  //   if (idToken && refreshToken) {
  //     this.http.get<User>(`/user`).subscribe({
  //       next: (user) => this.authSubject.next({
  //         idToken: localStorage.getItem('idToken') || idToken,
  //         user
  //       }),
  //       error: (err) => {
  //         this.errorService.showError('Session expired, log in again', () => {
  //           localStorage.removeItem('idToken');
  //           localStorage.removeItem('refreshToken');
  //           this.loginAnonymous().subscribe({
  //             error: (err) => this.errorService.showError('Error in anonymous login fallback: ' + err.message),
  //           });
  //         });
  //       }
  //     });
  //   } else {
  //     this.loginAnonymous().subscribe({
  //       error: (err) => this.errorService.showError('Error in anonymous login on startup: ' + err.message),
  //     });
  //   }
  // }

  public refreshTokens(): Observable<Auth> {
    var refreshToken = storage.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<JwtAuth>(`/auth/refresh`, { refreshToken }).pipe(
      tap((res) => {
        storage.idToken = res.idToken;
        storage.refreshToken = res.refreshToken;
        this.authSubject.next(res);
      }),
    );
  }

  public loginAnonymous(): Observable<Auth> {
    return this.http.post<shared.JwtAuth>(`/auth/anonymous`, {}).pipe(
      tap((res) => {
        storage.idToken = res.idToken;
        storage.refreshToken = res.refreshToken;
        this.authSubject.next(res);
      }),
    );
  }

  public login(req: LoginRequest): Observable<Auth> {
    return this.http.post<shared.JwtAuth>(`/auth/login`, req).pipe(
      tap((res) => {
        storage.idToken = res.idToken;
        storage.refreshToken = res.refreshToken;
        this.authSubject.next(res);
      }),
    );
  }

  public logout(): void {
    storage.idToken = null;
    storage.refreshToken = null;
    this.authSubject.next(null);
  }

  public getUser(): Observable<Auth> {
    return this.http.get<User>(`/user`).pipe(
      map((user) => {
        let auth: Auth = {
          idToken: storage.idToken || '',
          user
        };
        this.authSubject.next(auth);
        return auth;
      }),
    );
  }

  public setUser(req: UserChangeRequest): Observable<Auth> {
    var auth = this.authSubject.getValue();
    if (auth !== null) {
      let a: Auth = auth;
      return this.http.patch<void>(`/user`, req).pipe(
        map(() => {
          if (req.nickname) a.user.nickname = req.nickname;
          if (req.email) a.user.email = req.email;
          if (req.avatarId) a.user.avatarId = req.avatarId;
          this.authSubject.next(a);
          return a;
        }),

      );
    }
    return throwError(() => new Error('No authenticated user'));
  }
}