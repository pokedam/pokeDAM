import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { POKEMONS } from 'shared_types';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { ContentHeader } from '../../components/content-header/content-header';

export interface ProfileData {
  username: string;
  avatarUrl: string | null;
}

function contentOrNull(str: string): string | null {
  const trimmed = str.trim();
  return trimmed.length == 0 ? null : trimmed;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ContentHeader],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  authService = inject(AuthService);
  errorService = inject(ErrorService);

  form!: FormGroup;

  isLogged: boolean = false;
  nicknameErr: String | null = null;
  emailErr: String | null = null;
  passwordErr: String | null = null;
  avatarId: number | null = null;
  submitting: boolean = false;
  saveSuccess: boolean = false;

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
    const user = this.authService.auth!.user;

    this.avatarId = user.avatarIndex;
    this.initialAvatarId = this.avatarId;
    this.initialNickname = user.nickname;

    this.isLogged = user.email !== null;
    const initialEmail = user.email || '';

    this.form = new FormGroup({
      email: new FormControl(
        { value: initialEmail, disabled: this.isLogged },
        this.isLogged ? [] : [Validators.email]
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
      this.nicknameErr = "Trainer Name is required.";
    }

    let email = this.form.get('email');
    if (email?.invalid) {
      if (email.errors?.['required']) {
        this.emailErr = "Email is required.";
      } else if (email.errors?.['email']) {
        this.emailErr = "Please enter a valid email address.";
      }
    }

    let pass = this.form.get('password');
    if (pass?.invalid) {
      if (pass.errors?.['required']) {
        this.passwordErr = "Password is required.";
      } else if (pass.errors?.['minlength']) {
        this.passwordErr = "Password must be at least 8 characters.";
      }
    }
  }

  onSave() {
    if (this.submitting) return;

    this.validate();
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;

    const vals = this.form.getRawValue();
    this.authService.updateProfile({
      nickname: contentOrNull(vals.nickname || ''),
      avatarIndex: this.avatarId,
      email: contentOrNull(vals.email || ''),
      password: contentOrNull(vals.password || ''),
    }).subscribe({
      next: () => {
        this.isLogged = true;
        this.submitting = false;
        this.saveSuccess = true;

        const vals = this.form.getRawValue();
        this.initialNickname = vals.nickname || '';
        this.initialAvatarId = this.avatarId;
        this.form.get('password')?.setValue('');

        setTimeout(() => {
          this.saveSuccess = false;
        }, 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.errorService.showError(`Error updating profile: ${err}`);
      }
    });
  }
}
