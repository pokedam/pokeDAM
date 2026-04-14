import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { InGame } from './pages/in-game/in-game';
import { Presentation } from './pages/presentation/presentation';

export const routes: Routes = [
  { path: '', component: Presentation },
  { path: 'play', component: Home },
  { path: 'in-game', component: InGame }
];
