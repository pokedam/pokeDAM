import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Dialogue } from '../../components/dialogue/dialogue';
import { PlayerTile } from '../../components/player-tile/player-tile';
import { Player, Pokemon, Attack } from '../../models/game';
import { SingleTarget, MultiTarget } from 'shared_types';

@Component({
  selector: 'app-in-game',
  standalone: true,
  imports: [Dialogue, PlayerTile],
  templateUrl: './in-game.html',
  styleUrl: './in-game.css',
})
export class InGame implements OnInit {
  constructor(private cdr: ChangeDetectorRef) {}

  currentMenu: 'main' | 'attacks' | 'target-selection' = 'main';
  selectedOurPokemon: Pokemon | null = null;
  selectedAttack: Attack | null = null;
  selectedTargets: Pokemon[] = [];
  actionExecuted: boolean = false;
  players: Player[] = [
    {
      id: 'player-1',
      name: 'You',
      isCurrentTurn: true,
      pokeStates: ['available', 'active', 'available', 'active', 'available', 'active', 'available', 'available'],
      activePokemons: [
        { id: 25, name: 'Pikachu', level: 34, hp: 12, maxHp: 100, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', statusConditions: ['PAR'] },
        { id: 130, name: 'Gyarados', level: 41, hp: 150, maxHp: 180, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png', statusConditions: [] },
        { id: 59, name: 'Arcanine', level: 39, hp: 60, maxHp: 150, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png', statusConditions: [] }
      ]
    },
    {
      id: 'player-2',
      name: 'Player 2',
      isCurrentTurn: false,
      pokeStates: ['active', 'available', 'ko', 'available', 'active', 'available', 'available', 'active'],
      activePokemons: [
        { id: 6, name: 'Charizard', level: 44, hp: 20, maxHp: 170, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', statusConditions: ['ENV'] },
        { id: 94, name: 'Gengar', level: 40, hp: 45, maxHp: 120, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', statusConditions: [] },
        { id: 196, name: 'Espeon', level: 38, hp: 95, maxHp: 120, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png', statusConditions: [] }
      ]
    },
    {
      id: 'player-3',
      name: 'Player 3',
      isCurrentTurn: false,
      pokeStates: ['available', 'active', 'available', 'active', 'available', 'active', 'available', 'available'],
      activePokemons: [
        { id: 9, name: 'Blastoise', level: 42, hp: 160, maxHp: 180, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', statusConditions: [] },
        { id: 65, name: 'Alakazam', level: 37, hp: 15, maxHp: 110, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png', statusConditions: ['DOR'] },
        { id: 112, name: 'Rhydon', level: 38, hp: 70, maxHp: 170, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png', statusConditions: [] }
      ]
    },
    {
      id: 'player-4',
      name: 'Player 4',
      isCurrentTurn: false,
      pokeStates: ['available', 'available', 'active', 'available', 'active', 'available', 'active', 'available'],
      activePokemons: [
        { id: 149, name: 'Dragonite', level: 50, hp: 180, maxHp: 200, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png', statusConditions: [] },
        { id: 135, name: 'Jolteon', level: 36, hp: 40, maxHp: 110, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png', statusConditions: ['PAR'] },
        { id: 65, name: 'Alakazam', level: 40, hp: 18, maxHp: 120, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png', statusConditions: [] }
      ]
    },
    {
      id: 'player-5',
      name: 'Player 5',
      isCurrentTurn: false,
      pokeStates: ['active', 'available', 'active', 'available', 'available', 'active'],
      activePokemons: [
        { id: 143, name: 'Snorlax', level: 45, hp: 30, maxHp: 260, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png', statusConditions: [] },
        { id: 131, name: 'Lapras', level: 40, hp: 80, maxHp: 200, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png', statusConditions: ['CON'] },
        { id: 134, name: 'Vaporeon', level: 39, hp: 160, maxHp: 180, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png', statusConditions: [] }
      ]
    },
    {
      id: 'player-6',
      name: 'Player 6',
      isCurrentTurn: false,
      pokeStates: ['available', 'active', 'available', 'ko', 'active', 'available', 'available', 'active'],
      activePokemons: [
        { id: 68, name: 'Machamp', level: 41, hp: 120, maxHp: 170, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png', statusConditions: [] },
        { id: 103, name: 'Exeggutor', level: 38, hp: 40, maxHp: 150, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png', statusConditions: ['DOR'] },
        { id: 34, name: 'Nidoking', level: 39, hp: 18, maxHp: 160, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png', statusConditions: [] }
      ]
    }

    // {
    //   id: 'player-7',
    //   name: 'Player 7',
    //   isCurrentTurn: false,
    //   pokeStates: ['active', 'available', 'available'],
    //   activePokemons: [
    //     { id: 28, name: 'Sandslash', level: 34, hp: 70, maxHp: 130, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png', statusConditions: ['ENV'] },
    //     { id: 76, name: 'Golem', level: 37, hp: 140, maxHp: 150, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png', statusConditions: [] },
    //     { id: 107, name: 'Hitmonchan', level: 35, hp: 20, maxHp: 120, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/107.png', statusConditions: [] }
    //   ]
    // },
    // {
    //   id: 'player-8',
    //   name: 'Player 8',
    //   isCurrentTurn: false,
    //   pokeStates: ['active', 'available', 'ko', 'ko', 'ko', 'ko', 'ko', 'ko'],
    //   activePokemons: [
    //     { id: 142, name: 'Aerodactyl', level: 43, hp: 90, maxHp: 150, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png', statusConditions: [] },
    //     { id: 18, name: 'Pidgeot', level: 36, hp: 50, maxHp: 120, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png', statusConditions: ['PAR'] },
    //     { id: 212, name: 'Scizor', level: 40, hp: 22, maxHp: 140, avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/212.png', statusConditions: [] }
    //   ]
    // }
  ];

  // Inicialización de datos del juego.
  // Aquí se definen los ataques de los Pokémon usando los nombres (claves) 
  // que coinciden con el MovMap de shared_types para mantener la consistencia.
  ngOnInit() {
    const p1 = this.players.find(p => p.id === 'player-1');
    if (p1) {
      if (p1.activePokemons[0]) {
        p1.activePokemons[0].attacks = [
          { id: 1, name: 'rayo', type: 'Eléctrico', power: 40, targetCount: 1 },
          { id: 2, name: 'ataque-rapido', type: 'Normal', power: 40, targetCount: 1 }
        ];
      }
      if (p1.activePokemons[1]) {
        p1.activePokemons[1].attacks = [
          { id: 4, name: 'surf', type: 'Agua', power: 90, targetCount: 3 },
          { id: 5, name: 'hidrobomba', type: 'Agua', power: 110, targetCount: 1 }
        ];
      }
      if (p1.activePokemons[2]) {
        p1.activePokemons[2].attacks = [
          { id: 3, name: 'lanzallamas', type: 'Fuego', power: 90, targetCount: 1 },
          { id: 6, name: 'velocidad-extrema', type: 'Normal', power: 80, targetCount: 1 }
        ];
      }
    }
  }

  onPokemonSelect(event: { player: Player, pokemon: Pokemon }) {
    // Si ya se ejecutó un ataque, bloqueamos cualquier otra interacción hasta pulsar CANCELAR
    if (this.actionExecuted) return;

    // Lógica para cambiar de Pokémon propio (siempre disponible antes de confirmar ataque)
    if (event.player.id === 'player-1') {
      this.selectedOurPokemon = event.pokemon;
      this.selectedAttack = null;
      this.selectedTargets = [];

      // Mostramos los ataques del nuevo Pokémon seleccionado
      if (this.selectedOurPokemon.attacks && this.selectedOurPokemon.attacks.length > 0) {
        this.currentMenu = 'attacks';
      } else {
        this.currentMenu = 'main';
      }
      return;
    }

    // Lógica para selección de objetivos enemigos
    if (this.currentMenu === 'target-selection') {
      const index = this.selectedTargets.findIndex(p => p === event.pokemon);
      if (index > -1) {
        this.selectedTargets.splice(index, 1);
      } else {
        if (this.selectedAttack && this.selectedTargets.length < this.selectedAttack.targetCount) {
          this.selectedTargets.push(event.pokemon);
        }
      }

      if (this.selectedAttack && this.selectedTargets.length === this.selectedAttack.targetCount) {
        // Ejecutamos el ataque con un pequeño delay para que se vea el último objetivo seleccionado
        setTimeout(() => this.confirmAttack(), 200);
      }
    }
  }

  getSelectedPokemonsForTile(player: Player): Pokemon[] {
    // Si la acción ya se ejecutó o estamos seleccionando objetivos, mostramos los objetivos marcados
    if (this.actionExecuted || this.currentMenu === 'target-selection') {
      if (player.id !== 'player-1') {
        return this.selectedTargets;
      }
    }
    // Siempre mostramos nuestro Pokémon seleccionado si existe
    if (player.id === 'player-1' && this.selectedOurPokemon) {
      return [this.selectedOurPokemon];
    }
    return [];
  }

  onPokemonButtonClick() {
    this.currentMenu = 'main';
    this.selectedOurPokemon = null;
    this.selectedAttack = null;
    this.selectedTargets = [];
    this.actionExecuted = false;
  }

  onAttackSelect(attack: Attack) {
    if (this.actionExecuted) return;
    this.selectedAttack = attack;
    this.currentMenu = 'target-selection';
    this.selectedTargets = [];
  }

  cancelTargetSelection() {
    this.currentMenu = 'attacks';
    this.selectedAttack = null;
    this.selectedTargets = [];
  }

  // Método para confirmar la ejecución de un ataque.
  // En lugar de un alert, ahora procesa la acción usando las clases de shared_types.
  confirmAttack() {
    if (!this.selectedAttack || this.selectedTargets.length === 0) {
      alert('Selecciona al menos un objetivo.');
      return;
    }

    // El payload almacenará la información del ataque siguiendo la estructura oficial del juego.
    let payload: SingleTarget | MultiTarget;

    // Lógica para ataques de un solo objetivo (SingleTarget).
    if (this.selectedAttack.targetCount === 1) {
      const target = this.selectedTargets[0];
      // Buscamos al jugador y al Pokémon dentro del array global para obtener sus índices.
      const playerIdx = this.players.findIndex(p => p.activePokemons.includes(target));
      const pokemonIdx = this.players[playerIdx].activePokemons.indexOf(target);

      // Construimos el objeto SingleTarget con los índices encontrados.
      payload = {
        player_idx: playerIdx,
        pokemon_idx: pokemonIdx
      } as SingleTarget;

      console.log(`Confirmando acción de objetivo único: ${this.selectedAttack.name}`, payload);
    }
    // Lógica para ataques de múltiples objetivos (MultiTarget).
    else {
      // Mapeamos cada Pokémon seleccionado a su correspondiente índice de jugador y Pokémon.
      const targets: SingleTarget[] = this.selectedTargets.map(target => {
        const playerIdx = this.players.findIndex(p => p.activePokemons.includes(target));
        const pokemonIdx = this.players[playerIdx].activePokemons.indexOf(target);
        return {
          player_idx: playerIdx,
          pokemon_idx: pokemonIdx
        };
      });

      // Construimos el objeto MultiTarget que agrupa todos los objetivos.
      payload = {
        targets
      } as MultiTarget;

      console.log(`Confirmando acción multi-objetivo: ${this.selectedAttack.name}`, payload);
    }

    // Activamos el flag para mostrar el botón CANCELAR inmediatamente.
    this.actionExecuted = true;
    this.currentMenu = 'main';

    // Forzamos la detección de cambios para que el botón aparezca sin necesidad de otro click
    this.cdr.detectChanges();
  }
}