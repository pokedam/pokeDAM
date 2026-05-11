import type { PlayerPokemon } from 'shared_types';

export interface Player {
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
}

export interface InGamePokemon extends PlayerPokemon {
    hp: number;
}

export type Board = Player[];
