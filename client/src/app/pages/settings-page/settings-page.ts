import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ProfileDialog, ProfileData } from '../../components/profile-dialog/profile-dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ProfileDialog],
  template: `
    @if (authService.auth$ | async; as auth) {
      <app-profile-dialog 
        [initialUsername]="auth.user.nickname" 
        [initialAvatarUrl]="auth.user.avatarUrl"
        (save)="onSave($event)"
        (close)="onClose()"
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
  private location = inject(Location);

  onSave(data: ProfileData) {
    this.authService.updateProfile(data.username, data.avatarUrl).subscribe({
      next: () => {
        this.onClose();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        // For demonstration purposes, if backend fails, we could update local state
        // but typically we should show an error message.
        this.onClose();
      }
    });
  }

  onClose() {
    this.location.back();
  }
}
