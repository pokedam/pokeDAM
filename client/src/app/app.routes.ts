import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { InGame } from './pages/in-game/in-game';
import { Presentation } from './pages/presentation/presentation';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { SocketRouteGuard } from './guards/socket-route.guard';

export const routes: Routes = [
  { path: '', component: Presentation, canActivate: [SocketRouteGuard] },
  { path: 'play', component: Home, data: { requiresSocket: true }, canActivate: [SocketRouteGuard] },
  { path: 'in-game', component: InGame, data: { requiresSocket: true }, canActivate: [SocketRouteGuard] },
  { path: 'profile', component: Profile, canActivate: [SocketRouteGuard] },
  { path: 'login', component: Login, canActivate: [SocketRouteGuard] }
];
