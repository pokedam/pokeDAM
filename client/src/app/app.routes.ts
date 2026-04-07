import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { InGame } from './pages/in-game/in-game';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'in-game', component: InGame }
];
