import type { PlayerPokemon, PokemonResponse } from 'shared_types';

export interface Player {
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
}

export interface InGamePokemon extends PokemonResponse {
    hp: number;
    movsPp: number[];
}

export type Board = Player[];

export { movs } from "./movs";
export * from "./movs";
