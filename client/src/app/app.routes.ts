import { Routes } from '@angular/router';
import { Play } from './pages/play/play';
import { Presentation } from './pages/presentation/presentation';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { GameHistory } from './pages/game-history/game-history';
import { GameDetail } from './pages/game-history/game-detail/game-detail';
import { PcMenu } from './pages/pc-menu/pc-menu';
import { PcDetail } from './pages/pc-menu/pc-detail/pc-detail';

export const routes: Routes = [
  { path: '', component: Presentation },
  { path: 'play', component: Play },
  {
    path: 'pc',
    children: [
      { path: '', component: PcMenu },
      { path: ':id', component: PcDetail },
    ]
  },
  { path: 'profile', component: Profile },
  { path: 'login', component: Login },
  {
    path: 'history',
    children: [
      { path: '', component: GameHistory },
      { path: ':id', component: GameDetail },
    ]
  }
];