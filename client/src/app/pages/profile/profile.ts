import { Component, DoCheck, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { POKEMONS, User } from 'shared_types';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { ContentHeader } from '../../components/content-header/content-header';
import { AsyncButton, AsyncButtonController } from '../../components/async-button/async-button';
import { map, Observable, of } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

export interface ProfileData {
  username: string;
  avatarUrl: string | null;
}

function contentOrNull(str: string): string | null {
  const trimmed = str.trim();
  return trimmed.length == 0 ? null : trimmed;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AsyncButton, CommonModule, FormsModule, ReactiveFormsModule, ContentHeader, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, DoCheck {
  authService = inject(AuthService);
  errorService = inject(ErrorService);
  router = inject(Router);

  form!: FormGroup;

  isLogged: boolean = false;
  nicknameErr: String | null = null;
  emailErr: String | null = null;
  passwordErr: String | null = null;
  avatarId: number | null = null;

  @Input() saveController: AsyncButtonController = new AsyncButtonController();

  constructor() {
    this.saveController.callback = this.onSave.bind(this);
  }
  ngDoCheck(): void {
    let hasChanged = this.hasChanged();
    this.saveController.disabled = !hasChanged;
    if (hasChanged)
      this.saveController.state = 'init';


  }

  initialNickname: string = '';
  initialAvatarId: number | null = null

  selectedAvatarUrl(): string {
    let idx = this.avatarId!;

    return this.allAvatars.find(a => a.id === idx)?.url || '';
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
  allAvatars: { id: number, name: string, url: string }[] = [];
  availableAvatars: { id: number, name: string, url: string }[] = [];

  searchTerm = '';

  ngOnInit() {
    this.loadPokemonAvatars();
    this.initialize(this.authService.auth!.user);
  }

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

  loadPokemonAvatars() {
    this.allAvatars = POKEMONS.map((p) => ({
      id: p.id,
      name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      url: p.sprite
    }));
    this.availableAvatars = this.allAvatars;
  }

  filterAvatars() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.availableAvatars = this.allAvatars;
      return;
    }

    const idFilter = parseInt(term, 10);
    const isNumber = !isNaN(idFilter) && idFilter.toString() === term;

    this.availableAvatars = this.allAvatars.filter(p => {
      if (isNumber && p.id === idFilter) {
        return true;
      }
      return p.name.toLowerCase().includes(term);
    });
  }

  selectAvatar(id: number) {
    if (this.avatarId === id) this.avatarId = null;
    else this.avatarId = id;
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
        this.passwordErr = "Password must be at least 8 characters";
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  saveForm() {
    console.log("SAVE FORM");
    this.saveController.click();
  }

  onSave(): Observable<boolean> {
    this.validate();
    if (this.form.invalid) {
      return of(false);
    }

    const vals = this.form.getRawValue();
    const auth = this.authService.auth!;


    return this.authService.updateProfile({
      nickname: contentOrNull(vals.nickname || ''),
      avatarId: this.avatarId,
      email: contentOrNull(vals.email || ''),
      password: contentOrNull(vals.password || ''),
    }).pipe(
      map((auth) => {
        if (auth) {
          this.initialize(auth.user);
          return true;
        }
        return false;
      })
    );
  }
}
