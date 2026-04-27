import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { InGame } from './pages/in-game/in-game';
import { Presentation } from './pages/presentation/presentation';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', component: Presentation },
  { path: 'play', component: Home },
  { path: 'in-game', component: InGame },
  { path: 'settings', component: Settings }
];
