import { Component, HostListener } from '@angular/core';
import { Hamburger } from '../hamburguer/hamburger';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { POKEMONS, User } from 'shared_types';
import { AvatarCircle } from '../avatar-circle/avatar-circle';

@Component({
  selector: 'app-topbar',
  imports: [AvatarCircle, RouterLink, Hamburger],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  constructor(public authService: AuthService) { }

  isDrawerOpen = false;

  get user(): User {
    return this.authService.auth()!.user;
  }

  getAvatarUrl(): string {
    let idx = this.user.avatarId!;
    return POKEMONS[idx]!.sprite;
  }

  getAvatarInitial(): string {
    return this.user.nickname.charAt(0).toUpperCase();
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  // onDrawerSettings() {
  //   this.closeDrawer();
  //   this.settingsClick.emit();
  // }

  // onDrawerPokedex() {
  //   this.closeDrawer();
  //   this.pokedexClick.emit();
  // }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDrawer();
  }
}
