import { Component } from '@angular/core';
import { Topbar } from '../../components/topbar/topbar';
import { LoginDialog } from '../../components/login-dialog/login-dialog';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-presentation',
  imports: [Topbar, LoginDialog, RouterLink],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
  isLoggedIn = false;
  username = 'Trainer';
  avatarUrl: string | null = null;
  showLoginDialog = false;

  onLoginClick() {
    this.showLoginDialog = true;
  }

  logout() {
    this.isLoggedIn = false;
    this.username = 'Trainer';
  }

  onSettings() {
    console.log('Settings clicked');
  }

  login() {
    this.isLoggedIn = true;
    this.username = 'Ash Ketchum';
    this.showLoginDialog = false;
  }

  closeDialog() {
    this.showLoginDialog = false;
  }
}
