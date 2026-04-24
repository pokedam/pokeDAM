import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ErrorModal } from './components/error-modal/error-modal';
import { LoginDialog } from './components/login-dialog/login-dialog';
import { Topbar } from './components/topbar/topbar';

@Component({
  selector: 'app-root',
  imports: [Topbar, LoginDialog, RouterOutlet, RouterOutlet, ErrorModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showLoginDialog = false;
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  protected readonly title = signal('client');

  
  onLoginClick() {
    this.showLoginDialog = true;
  }

  onSettings() {
    this.router.navigate(['settings'], { relativeTo: this.route });
  }

  closeDialog() {
    this.showLoginDialog = false;
  }
}
