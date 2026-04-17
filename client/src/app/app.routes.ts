import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { InGame } from './pages/in-game/in-game';
import { Presentation } from './pages/presentation/presentation';
import { SettingsPage } from './pages/settings-page/settings-page';

export const routes: Routes = [
  {
    path: '',
    component: Presentation,
    children: [
      { path: 'settings', component: SettingsPage }
    ]
  },
  {
    path: 'play',
    component: Home,
    children: [
      { path: 'settings', component: SettingsPage }
    ]
  },
  { path: 'in-game', component: InGame }
];
