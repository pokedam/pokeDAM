import { Component, DoCheck, Input, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Pokemon, POKEMONS, pokemonSpriteUrl, User } from 'shared_types';
import { AvatarCircle } from '../../components/avatar-circle/avatar-circle';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { ContentHeader } from '../../components/content-header/content-header';
import { AsyncButton } from '../../components/async-button/async-button';
import { catchError, EMPTY, map, Observable, of, tap } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { PokemonGrid } from '../../components/pokemon-grid/pokemon-grid';

export interface ProfileData {
  username: string;
  avatarUrl: string | null;
}

function contentOrNull(str: string | null): string | null {
  if (str === null) return null;
  const trimmed = str.trim();
  return trimmed.length == 0 ? null : trimmed;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AsyncButton,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContentHeader,
    RouterLink,
    AvatarCircle,
    PokemonGrid
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, DoCheck {
  authService = inject(AuthService);
  errorService = inject(ErrorService);
  router = inject(Router);

  cdr = inject(ChangeDetectorRef);

  form!: FormGroup;

  isLogged: boolean = false;
  nicknameErr: string | null = null;
  emailErr: string | null = null;
  passwordErr: string | null = null;
  avatarId: number | null = null;

  @ViewChild('saveBtn') saveBtn!: AsyncButton;

  // constructor() {
  //   this.saveController.callback = this.onSave.bind(this);
  // }

  ngOnInit() {
    this.available = POKEMONS;
    this.initialize(this.authService.auth()!.user);
  }

  ngDoCheck(): void {
    let hasChanged = this.hasChanged();
    //this.saveController.disabled = !hasChanged;
    if (hasChanged)
      this.saveBtn.state = 'init';
  }

  initialNickname: string = '';
  initialAvatarId: number | null = null

  selectedAvatarUrl(): string {
    const idx = this.avatarId!;
    const pokemon = POKEMONS.find(P => P.id === idx);
    return pokemon ? pokemonSpriteUrl(pokemon.id) : '';
  }

  hasChanged(): boolean {
    const vals = this.form.getRawValue();

    return this.isLogged
      ? (vals.nickname || '').trim() !== this.initialNickname.trim()
      || this.avatarId !== this.initialAvatarId
      || (vals.password || '').trim() !== ''
      : (vals.email || '').trim() !== '';
  }
  // Lista de avatares (IDs de Pokémon) desde JSON
  //allAvatars: { id: number, name: string, url: string }[] = [];
  available: Pokemon[] = [];

  searchTerm = '';

  initialize(user: User) {
    this.avatarId = user.avatarId;
    this.initialAvatarId = this.avatarId;
    this.initialNickname = user.nickname;

    this.isLogged = user.email !== null;
    const initialEmail = user.email || '';

    this.form = new FormGroup({
      email: new FormControl(
        { value: initialEmail, disabled: this.isLogged },
        this.isLogged ? [] : [Validators.required, Validators.email]
      ),

      password: new FormControl(
        '',
        this.isLogged
          ? [Validators.minLength(8)]
          : [Validators.required, Validators.minLength(8)]
      ),

      nickname: new FormControl(this.initialNickname, [Validators.required])
    });
  }



  filterAvatars() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.available = POKEMONS;
      return;
    }

    const idFilter = parseInt(term, 10);
    const isNumber = !isNaN(idFilter) && idFilter.toString() === term;

    this.available = POKEMONS.filter(p => {
      if (isNumber && p.id === idFilter) {
        return true;
      }
      return p.name.toLowerCase().includes(term);
    });
  }

  selectAvatar(ids: number[]) {
    this.avatarId = ids.length > 0 ? ids[0] : null;
  }

  validate() {
    this.nicknameErr = null;
    this.emailErr = null;
    this.passwordErr = null;

    let nickname = this.form.get('nickname');
    if (nickname?.invalid && nickname.errors?.['required']) {
      this.nicknameErr = "Nickname is required";
    }

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
        this.passwordErr = "Password too short!";
      }
    }
  }

  logout() {
    this.authService.logout();
    this.authService.loginAnonymous().pipe(
      tap(a => {
        this.router.navigate(['/login']);
      }),
      catchError(_ => {
        this.errorService.show("Connection failed");
        return EMPTY;
      })
    ).subscribe();
  }

  onSave(): Observable<boolean> {
    this.validate();
    if (this.form.invalid) {
      return of(false);
    }

    const vals = this.form.getRawValue();
    const data = {
      nickname: contentOrNull(vals.nickname),
      avatarId: this.avatarId,
      email: contentOrNull(vals.email),
      password: contentOrNull(vals.password),
    };
    return this.authService.setUser(data).pipe(
      map((auth) => {

        if (auth) {
          this.initialize(auth.user);
          return true;
        }
        return false;
      }),
      catchError((err) => {
        if (err.status === 409) {
          this.emailErr = "Email already in use";
          this.cdr.detectChanges();
        } else this.errorService.show('Connection failed');

        return of(false);
      }),

    );
  }
}
