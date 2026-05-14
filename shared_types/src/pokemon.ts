import { MovKey } from "./game";

export interface Pokemon {
    types: PokemonTypes,
    id: number;
    name: string;
    statsBase: Stats;
}

export type PokemonType = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon' | 'steel' | 'fairy';

export type Gender = 'male' | 'female' | 'genderless';

export interface PokemonTypes {
    main: PokemonType
    secondary?: PokemonType
}

export interface Stats {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

export interface PokemonResponse {
    id: number;
    pokedexIdx: number;
    isActive: boolean;
}

export interface PokemonResponseFull {
    id: number;
    pokedexIdx: number;
    movs: MovKey[];
    stats: Stats;
}

// @ts-ignore: Auto-generated import.
import __pokemons from './generated/pokemon.json';
export const POKEMONS: Pokemon[] = __pokemons.map(p => ({
    ...p,
    types: {
        main: p.types.main as PokemonType,
        secondary: p.types.secondary as PokemonType | undefined,
    },
}));

export function pokemon(pokedexIdx: number): Pokemon {
    return POKEMONS[pokedexIdx - 1];
}

export function pokemonSpriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}