import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-menu-button',
  imports: [CommonModule],
  templateUrl: './user-menu-button.html',
  styleUrl: './user-menu-button.css',
})
export class UserMenuButton {
  @Input() isLoggedIn = false;
  @Input() username = 'Trainer';
  @Input() avatarUrl: string | null = null;

  @Output() loginClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();

  isDropdownOpen = false;

  get avatarInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }

  onLoginClick() {
    this.loginClick.emit();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onSettings() {
    this.isDropdownOpen = false;
    this.settingsClick.emit();
  }

  onLogout() {
    this.isDropdownOpen = false;
    this.logoutClick.emit();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isDropdownOpen = false;
  }
}
