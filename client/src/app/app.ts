import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModal } from './components/error-modal/error-modal';
import { Topbar } from './components/topbar/topbar';
import { AuthService } from './services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Topbar, RouterOutlet, RouterOutlet, ErrorModal, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showLoginDialog = false;

  // private router = inject(Router);
  // private route = inject(ActivatedRoute);
  public authService = inject(AuthService);

  protected readonly title = signal('client');


}
