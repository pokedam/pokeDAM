import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Topbar } from '../../components/topbar/topbar';
import { LoginDialog } from '../../components/login-dialog/login-dialog';

@Component({
  selector: 'app-presentation',
  imports: [Topbar, LoginDialog, RouterLink, RouterOutlet],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
  showLoginDialog = false;

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  onLoginClick() {
    this.showLoginDialog = true;
  }

  onSettings() {
    this.router.navigate(['settings'], { relativeTo: this.route });
  }

  login() {
    this.showLoginDialog = false;
  }

  closeDialog() {
    this.showLoginDialog = false;
  }
}
