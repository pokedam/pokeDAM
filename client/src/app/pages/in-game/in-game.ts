import { Component } from '@angular/core';
import { Dialogue } from '../../components/dialogue/dialogue';
import { PlayerTile } from '../../components/player-tile/player-tile';
import { Player } from '../../models/game.models';

@Component({
  selector: 'app-in-game',
  standalone: true,
  imports: [Dialogue, PlayerTile],
  templateUrl: './in-game.html',
  styleUrl: './in-game.css',
})
export class InGame {

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

}