import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoginDialog } from '../../components/login-dialog/login-dialog';
import { Topbar } from '../../components/topbar/topbar';
import { Dialogue, DialogueSequence } from '../../components/dialogue/dialogue';
import { BattleArena } from '../../components/battle-arena/battle-arena';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [LoginDialog, Topbar, BattleArena, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  isLoggedIn = false;
  username = 'Trainer';
  avatarUrl: string | null = null;

  showLoginDialog = false;

  matchDialogue: DialogueSequence = [
    '¡Hola, entrenador!',
    { type: 'pause', duration: 400 },
    'Actualmente el menú de acceso a partidas',
    { type: 'pause', duration: 200 },
    'se encuentra en construcción.',
    { type: 'jump' },
    'Próximamente podrás buscar rivales y combatir',
    { type: 'pause', duration: 200 },
    'al más',
    { type: 'pause', duration: 100 },
    { type: 'text', value: 'puro', speed: 100 },
    { type: 'pause', duration: 150 },
    { type: 'text', value: 'estilo', speed: 40 },
    { type: 'pause', duration: 400 },
    { type: 'text', value: 'Pokémon.', speed: 150 }
  ];

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.loginAnonymous();
  }

  onLoginClick() {
    this.showLoginDialog = true;
  }

  login() {
    this.isLoggedIn = true;
    this.username = 'Ash';   // TODO: use real username from auth service
    this.showLoginDialog = false;
  }

  logout() {
    this.isLoggedIn = false;
    this.username = 'Trainer';
    this.avatarUrl = null;
  }

  onSettings() {
    // TODO: navigate to settings
    console.log('Settings clicked');
  }

  closeDialog() {
    this.showLoginDialog = false;
  }
}