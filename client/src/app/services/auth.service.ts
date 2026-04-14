import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface AuthResponse {
  id_token: string;
  refresh_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/auth'; // Adjust based on your server
  
  private usernameSubject = new BehaviorSubject<string>('Trainer');
  public username$ = this.usernameSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private idTokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  public idToken$ = this.idTokenSubject.asObservable();

  private refreshTokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('refresh_token'));
  public refreshToken$ = this.refreshTokenSubject.asObservable();

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (token) {
      // In a real app we might decode the JWT to get the username or roles,
      // and determine if they are anonymous or not. For now:
      this.usernameSubject.next('Returned User');
      this.isLoggedInSubject.next(true); 
    }
  }

  loginAnonymous() {
    // Check if we already have a token
    if (localStorage.getItem('token')) {
      return;
    }

    this.http.post<AuthResponse>(`${this.apiUrl}/anonymous`, {}).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.id_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        this.idTokenSubject.next(res.id_token);
        this.refreshTokenSubject.next(res.refresh_token);
        this.usernameSubject.next('Anonymous');
        // We might not set isLoggedIn to true if it's an anonymous user, usually
        // isLoggedIn is for registered users, but let's keep it simple.
      },
      error: (err) => console.error('Error in anonymous login:', err)
    });
  }
}