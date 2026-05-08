import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModal } from './components/error-modal/error-modal';
import { Topbar } from './components/topbar/topbar';
import { AuthService } from './services/auth.service';
import { ErrorService } from './services/error.service';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [Topbar, RouterOutlet, RouterOutlet, ErrorModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  auth = inject(AuthService);
  error = inject(ErrorService);

  get isLogged() {
    return this.auth.auth() != null;
  }

  ngOnInit(): void {
    // If app has credentials, get user associated
    this.auth.getUser()
      .pipe(
        catchError((_) => {
          // Log error for debugging
          // Failed, fallback to anonymous login
          this.error.show('Session expired, log in again');
          return this.auth.loginAnonymous().pipe(
            catchError((err) => {
              console.error('Anonymous login failed', err);
              this.error.show('Connection failed.');
              return EMPTY;
            }),
          );
        }),
      ).subscribe();
  }
}
