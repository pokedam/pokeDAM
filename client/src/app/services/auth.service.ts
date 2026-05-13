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
  private http = inject(HttpService);

  private _auth = signal<Auth | null>(null, { equal: (_, __) => false });

  public get auth() {
    return this._auth.asReadonly();
  }

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
        let auth: Auth = {
          idToken: storage.idToken || '',
          user
        };
        this._auth.set(auth);
        return auth;
      }),
    );
  }

  public setUser(req: UserChangeRequest): Observable<Auth> {
    return this.http.patch<User>(`/user`, req).pipe(
      map(_ => {
        let auth = this._auth();
        if (auth == null) throw new Error('No authenticated user');

        if (req.nickname) auth.user.nickname = req.nickname;
        if (req.email) auth.user.email = req.email;
        if (req.avatarId) auth.user.avatarId = req.avatarId;

        this._auth.set(auth);

        return auth;

      })
    );

  }
}