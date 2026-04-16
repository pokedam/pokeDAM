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
  showLoginDialog = false;

  onLoginClick() {
    this.showLoginDialog = true;
  }

  onSettings() {
    console.log('Settings clicked');
  }

  login() {
    this.showLoginDialog = false;
  }

  closeDialog() {
    this.showLoginDialog = false;
  }
}
