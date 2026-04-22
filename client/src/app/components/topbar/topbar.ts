import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserMenuButton } from '../user-menu-button/user-menu-button';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-topbar',
  imports: [UserMenuButton, RouterLink, AsyncPipe],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  constructor(public authService: AuthService) { }

  @Output() settingsClick = new EventEmitter<void>();
  @Output() pokedexClick = new EventEmitter<void>();

  isDrawerOpen = false;

  getAvatarInitial(username: string | undefined): string {
    return username ? username.charAt(0).toUpperCase() : '?';
  }

  getAvatarUrl(index: number | undefined): string {
    const seed = index !== undefined ? `avatar-${index}` : 'default';
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
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
