import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UserMenuButton } from '../user-menu-button/user-menu-button';

@Component({
  selector: 'app-topbar',
  imports: [UserMenuButton],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  @Input() isLoggedIn = false;
  @Input() username = 'Trainer';
  @Input() avatarUrl: string | null = null;

  @Output() loginClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();
  @Output() pokedexClick = new EventEmitter<void>();

  isDrawerOpen = false;

  get avatarInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  onDrawerLogin() {
    this.closeDrawer();
    this.loginClick.emit();
  }

  onDrawerLogout() {
    this.closeDrawer();
    this.logoutClick.emit();
  }

  onDrawerSettings() {
    this.closeDrawer();
    this.settingsClick.emit();
  }

  onDrawerPokedex() {
    this.closeDrawer();
    this.pokedexClick.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDrawer();
  }
}
