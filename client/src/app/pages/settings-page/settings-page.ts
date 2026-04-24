import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ProfileDialog } from '../../components/profile-dialog/profile-dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ProfileDialog],
  template: `
    @if (authService.auth$ | async; as auth) {
      <app-profile-dialog 
        [initialUsername]="auth.user.nickname" 
        [initialAvatar]="auth.user.avatarIndex ?? null"
      />
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SettingsPage {
  authService = inject(AuthService);
}
