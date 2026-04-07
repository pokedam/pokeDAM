import { Component } from '@angular/core';
import { Dialogue, DialogueSequence } from '../../components/dialogue/dialogue';

@Component({
  selector: 'app-home',
  imports: [Dialogue],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  dialogueSequence: DialogueSequence = [
    'Este es un ejemplo de diálogo de PokeDAM.',
    { type: 'pause', duration: 400 },
    'Los dialógos se ajustan al tamaño del contenedor y paran de escribirse cuando llegan al final de este.',
    { type: 'pause', duration: 400 },
    'Si pulsas Enter o la barra espaciadora,',
    { type: 'pause', duration: 100 },
    'completarás el espacio disponible del cuadro de diálogo con texto.',
    { type: 'pause', duration: 400 },
    'Además,',
    { type: 'pause', duration: 100 },
    'puedes agregar tus propios saltos de diálogo como desees,',
    { type: 'pause', duration: 100 },
    'forzando al sistema a dejar de escribir y pasar a un diálogo en blanco.',
    { type: 'jump' },
    'Por ejemplo,',
    { type: 'pause', duration: 100 },
    'este nuevo diálogo empezó y termina prematuramente.',
    { type: 'jump' },
    'Por último,',
    { type: 'pause', duration: 100 },
    'puedes configurar tus propias pausas y velocidades de texto.',
    { type: 'pause', duration: 400 },
    'Permitiendo',
    { type: 'pause', duration: 500 },
    'dar',
    { type: 'pause', duration: 400 },
    { type: 'text', value: 'dramatismo', speed: 150 },
    { type: 'pause', duration: 300 },
    { type: 'text', value: 'a tus', speed: 10 },
    { type: 'pause', duration: 1000 },
    { type: 'text', value: 'diálogos.', speed: 300 }
  ];
}
