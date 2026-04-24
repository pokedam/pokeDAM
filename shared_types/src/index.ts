export * from './result';
export * from './lobby';
export * from './auth';

export interface PokemonGenerated {
    id: number;
    nombre: string;
    sprite: string;
}

// @ts-ignore: Este archivo se genera automáticamente al instalar/compilar (ignorar error en IDE)
import dataset from './generated/pokemon.json';

export const POKEMONS: PokemonGenerated[] = dataset || [];