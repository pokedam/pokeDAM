import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, map, catchError, throwError, Observable, of } from 'rxjs';

export interface Auth {
  idToken: string,
  user: User,
}

export interface User {
  id: number,
  refreshToken: string,
  nickname: string,
  email: string | null,
  avatarUrl: string | null,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/'; // Adjust based on your server

  private authSubject = new BehaviorSubject<Auth | null>(null);
  public auth$ = this.authSubject.asObservable();

  public get auth(): Auth | null {
    return this.authSubject.getValue();
  }

  constructor() {
    const idToken = localStorage.getItem('idToken');
    const refreshToken = localStorage.getItem('refreshToken');

    console.log("AuthService initialized. ID Token:", idToken, "Refresh Token:", refreshToken);
    if (idToken && refreshToken) {
      this.http.get<User>(`${this.apiUrl}auth/user`).subscribe({
        next: (user) => this.authSubject.next({
          idToken: localStorage.getItem('idToken') || idToken,
          user
        }),
        error: (err) => {
          console.error('Error in user POST http request:', err);
          localStorage.removeItem('idToken');
          localStorage.removeItem('refreshToken');
          this.loginAnonymous().subscribe({
            error: (err) => console.error('Error in anonymous login fallback:', err)
          });
        }
      });
    } else {
      this.loginAnonymous().subscribe({
        error: (err) => console.error('Error in anonymous login on startup:', err)
      });
    }
  }

  public refreshTokens(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<Auth>(`${this.apiUrl}auth/refresh`, { refresh_token: refreshToken }).pipe(
      tap((res) => {
        localStorage.setItem('idToken', res.idToken);
        localStorage.setItem('refreshToken', res.user.refreshToken);
        this.authSubject.next(res);
      }),
      map((res) => res.idToken)
    );
  }

  public loginAnonymous(): Observable<string> {
    return this.http.post<Auth>(`${this.apiUrl}auth/anonymous`, {}).pipe(
      tap((res) => {
        localStorage.setItem('idToken', res.idToken);
        localStorage.setItem('refreshToken', res.user.refreshToken);
        this.authSubject.next(res);
      }),
      map((res) => res.idToken)
    );
  }

  public updateProfile(nickname: string, avatarUrl: string | null): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}auth/user`, { nickname, avatarUrl }).pipe(
      map(res => {
        const currentAuth = this.authSubject.getValue();
        return (res && res.id) ? res : { ...currentAuth?.user, nickname, avatarUrl } as User;
      }),
      catchError((err) => {
        console.warn('Server update failed, performing local update only:', err);
        const currentAuth = this.authSubject.getValue();
        const fallbackUser = { ...currentAuth?.user, nickname, avatarUrl } as User;
        return of(fallbackUser);
      }),
      tap((updatedUser) => {
        const currentAuth = this.authSubject.getValue();
        if (currentAuth) {
          console.log('Updating profile in local state:', updatedUser);
          this.authSubject.next({
            ...currentAuth,
            user: updatedUser
          });
        }
      })
    );
  }
}