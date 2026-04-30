import { Injectable, inject, signal } from '@angular/core';
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

  private _auth = signal<Auth | null>(null);

  public get auth() {
    return this._auth.asReadonly();
  }


  // public get avatarUrl(): string | null {
  //   const auth = this.auth();
  //   if (auth && auth.user.avatarId !== null) {
  //     return `assets/avatars/avatar${auth.user.avatarId}.png`;
  //   }
  //   return null;
  // }

  // public get auth(): Auth | null {
  //   return this.authSubject.getValue();
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
        this._auth.set(res);
      }),
    );
  }

  public loginAnonymous(): Observable<Auth> {
    return this.http.post<shared.JwtAuth>(`/auth/anonymous`, {}).pipe(
      tap((res) => {
        storage.idToken = res.idToken;
        storage.refreshToken = res.refreshToken;
        this._auth.set(res);
      }),
    );
  }

  public login(req: LoginRequest): Observable<Auth> {
    return this.http.post<shared.JwtAuth>(`/auth/login`, req).pipe(
      tap((res) => {
        storage.idToken = res.idToken;
        storage.refreshToken = res.refreshToken;
        this._auth.set(res);
      }),
    );
  }

  public logout(): void {
    storage.idToken = null;
    storage.refreshToken = null;
    this._auth.set(null);
  }

  public getUser(): Observable<Auth> {
    return this.http.get<User>(`/user`).pipe(
      map((user) => {
        console.dir(user);
        let auth: Auth = {
          idToken: storage.idToken || '',
          user
        };
        console.dir(auth);
        this._auth.set(auth);
        return auth;
      }),
    );
  }

  public setUser(req: UserChangeRequest): Observable<Auth> {
    var auth = this._auth();
    if (auth !== null) {
      let a: Auth = auth;
      return this.http.patch<void>(`/user`, req).pipe(
        map(() => {
          if (req.nickname) a.user.nickname = req.nickname;
          if (req.email) a.user.email = req.email;
          if (req.avatarId) a.user.avatarId = req.avatarId;
          this._auth.set(a);
          return a;
        }),

      );
    }
    return throwError(() => new Error('No authenticated user'));
  }
}