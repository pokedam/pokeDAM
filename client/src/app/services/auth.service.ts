import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, map, catchError, throwError, Observable } from 'rxjs';

export interface Auth {
  idToken: string,
  user: User,
}

export interface User {
  id: number,
  refreshToken: string,
  nickname: string,
  email: string | null,
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

}