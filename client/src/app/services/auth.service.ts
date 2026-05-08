import { Injectable, inject, signal } from '@angular/core';
import { tap, map, throwError, Observable, } from 'rxjs';
import shared, { JwtAuth, LoginRequest, User, UserChangeRequest } from 'shared_types';
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
  private _http = inject(HttpService);
  private _auth = signal<Auth | null>(null, { equal: (_, __) => false });

  auth = this._auth.asReadonly();

  public refreshTokens(): Observable<Auth> {
    var refreshToken = storage.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this._http.post<JwtAuth>(`/auth/refresh`, { refreshToken }).pipe(
      tap((res) => {
        console.log("Refreshed tokens:", res);
        storage.idToken = res.idToken;
        storage.refreshToken = res.refreshToken;
        this._auth.set(res);
      }),
    );
  }

  public loginAnonymous(): Observable<Auth> {
    return this._http.post<shared.JwtAuth>(`/auth/anonymous`, {}).pipe(
      tap((res) => {
        storage.idToken = res.idToken;
        storage.refreshToken = res.refreshToken;
        this._auth.set(res);
      }),
    );
  }

  public login(req: LoginRequest): Observable<Auth> {
    return this._http.post<shared.JwtAuth>(`/auth/login`, req).pipe(
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
    return this._http.get<User>(`/user`).pipe(
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
      return this._http.patch<void>(`/user`, req).pipe(
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