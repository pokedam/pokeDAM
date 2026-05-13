import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { InGame } from './pages/in-game/in-game';
import { Presentation } from './pages/presentation/presentation';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { PcMenu } from './components/pc-menu/pc-menu';
import { TeamMenu } from './components/team-menu/team-menu';

export const routes: Routes = [
  { path: '', component: Presentation },
  { path: 'play', component: Home, data: { socket: true}  },
  { path: 'in-game', component: InGame, data: { socket: true}  },
  { path: 'profile', component: Profile },
  { path: 'login', component: Login},
  { path: 'pc', component: PcMenu },
  { path: 'matches', component: TeamMenu },
  { path: 'team', component: TeamMenu }
];
