import { Component, DoCheck, Input, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { ContentHeader } from '../../components/content-header/content-header';
import { AsyncButton } from '../../components/async-button/async-button';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface Login {
  username: string;
  avatarUrl: string | null;
}

function contentOrNull(str: string): string | null {
  const trimmed = str.trim();
  return trimmed.length == 0 ? null : trimmed;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AsyncButton, CommonModule, FormsModule, ReactiveFormsModule, ContentHeader],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  authService = inject(AuthService);
  errorService = inject(ErrorService);
  router = inject(Router);

  form!: FormGroup;

  emailErr: String | null = null;
  passwordErr: String | null = null;

  @ViewChild('loginBtn') loginBtn!: AsyncButton;

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(
        this.authService.auth?.user.email || '',
        [Validators.required, Validators.email]
      ),

      password: new FormControl(
        '',
        [Validators.required, Validators.minLength(8)]
      ),
    });
  }

  validate() {
    this.emailErr = null;
    this.passwordErr = null;


    let email = this.form.get('email');
    if (email?.invalid) {
      if (email.errors?.['required']) {
        this.emailErr = "Email is required";
      } else if (email.errors?.['email']) {
        this.emailErr = "Invalid email";
      }
    }

    let pass = this.form.get('password');
    if (pass?.invalid) {
      if (pass.errors?.['required']) {
        this.passwordErr = "Password is required";
      } else if (pass.errors?.['minlength']) {
        this.passwordErr = "Password must be at least 8 characters";
      }
    }
  }

  onLogin(): Observable<boolean> {
    this.validate();
    if (this.form.invalid) {
      return of(false);
    }

    const vals = this.form.getRawValue();

    return this.authService.login({
      email: vals.email,
      password: vals.password,
    }).pipe(
      map((a) => {
        console.log(`logged in as ${a.user.nickname}`);
        this.router.navigate(['/profile']);
        return true;
      }),
      catchError((err) => {
        console.error(`Login failed: ${err.message}`);
        this.errorService.show('Login failed: ' + err.message);
        return of(false);
      })
    );
  }
}
