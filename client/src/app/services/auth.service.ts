import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, map, catchError, throwError, Observable } from 'rxjs';
import { ErrorService } from './error.service';
import shared, { JwtAuth } from 'shared_types';

export interface Auth {
  idToken: string,
  user: User,
}

export interface User {
  id: number,
  nickname: string,
  email: string | null,
  avatarIndex: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private errorService = inject(ErrorService);
  private apiUrl = 'http://localhost:8080'; // Adjust based on your server

  private authSubject = new BehaviorSubject<Auth | null>(null);
  public auth$ = this.authSubject.asObservable();

  public get avatarUrl(): string | null {
    const auth = this.authSubject.getValue();
    if (auth && auth.user.avatarIndex !== null) {
      return `assets/avatars/avatar${auth.user.avatarIndex}.png`;
    }
    return null;
  }

  public get auth(): Auth | null {
    return this.authSubject.getValue();
  }

  constructor() {
    const idToken = localStorage.getItem('idToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (idToken && refreshToken) {
      this.http.get<User>(`${this.apiUrl}/user`).subscribe({
        next: (user) => this.authSubject.next({
          idToken: localStorage.getItem('idToken') || idToken,
          user
        }),
        error: (err) => {
          this.errorService.showError('Failed loading account: ' + err.message);
          localStorage.removeItem('idToken');
          localStorage.removeItem('refreshToken');
          this.loginAnonymous().subscribe({
            error: (err) => this.errorService.showError('Error in anonymous login fallback: ' + err.message),
          });
        }
      });
    } else {
      this.loginAnonymous().subscribe({
        error: (err) => this.errorService.showError('Error in anonymous login on startup: ' + err.message),
      });
    }
  }

  public refreshTokens(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<JwtAuth>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((res) => {
        localStorage.setItem('idToken', res.idToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.authSubject.next(res);
      }),
      map((res) => res.idToken)
    );
  }

  public loginAnonymous(): Observable<string> {
    return this.http.post<shared.JwtAuth>(`${this.apiUrl}/auth/anonymous`, {}).pipe(
      tap((res) => {
        localStorage.setItem('idToken', res.idToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.authSubject.next(res);
      }),
      map((res) => res.idToken)
    );
  }

  public updateProfile(nickname: string, avatarUrl: string | null): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/auth/profile`, { nickname, avatarUrl }).pipe(
      tap((updatedUser) => {
        const currentAuth = this.authSubject.getValue();
        if (currentAuth) {
          this.authSubject.next({
            ...currentAuth,
            user: updatedUser
          });
        }
      })
    );
  }
}