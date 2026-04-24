import { Component } from '@angular/core';

import {  DialogueSequence } from '../../components/dialogue/dialogue';
import { BattleArena } from '../../components/battle-arena/battle-arena';

@Component({
  selector: 'app-home',
  imports: [ BattleArena ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

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

}