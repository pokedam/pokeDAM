export * from './result';
export * from './lobby';
export * from './auth';
export * from './pokemon';
export * from './game';

export interface PokemonGenerated {
    id: number;
    name: string;
    sprite: string;
}

// @ts-ignore: Auto-generated import.
import dataset from './generated/pokemon.json';

export const POKEMONS: PokemonGenerated[] = dataset || [];