import { Component, EventEmitter, HostListener, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-menu-button',
  imports: [CommonModule],
  templateUrl: './user-menu-button.html',
  styleUrl: './user-menu-button.css',
})
export class UserMenuButton {
  private authService = inject(AuthService);

  @Input({ required: true }) auth: any;
  @Output() settingsClick = new EventEmitter<void>();

  isDropdownOpen = false;

  getAvatarInitial(username: string | undefined): string {
    return username ? username.charAt(0).toUpperCase() : '?';
  }

  getAvatarUrl(index: number | undefined): string {
    const seed = index !== undefined ? `avatar-${index}` : 'default';
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onSettings() {
    this.isDropdownOpen = false;
    this.settingsClick.emit();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isDropdownOpen = false;
  }
}
