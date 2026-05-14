import { Routes } from '@angular/router';
import { Play } from './pages/play/play';
import { Presentation } from './pages/presentation/presentation';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { GameHistory } from './pages/game-history/game-history';

export const routes: Routes = [
  { path: '', component: Presentation },
  { path: 'play', component: Play },
  { path: 'profile', component: Profile },
  { path: 'login', component: Login },
  { path: 'history', component: GameHistory }

];