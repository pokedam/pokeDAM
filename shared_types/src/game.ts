import { Stats } from "./pokemon";

export type Effectiveness = 4 | 2 | 1 | 0.5 | 0.25 | 0;

export type PlayerId = number;
export type GroupId = string;
export type Id = PlayerId | GroupId;

export interface PokemonRef {
    playerId: PlayerId;
    pokemonIdx: number;
}

export interface MovRef extends PokemonRef {
    movIdx: number;
}

export interface Damage {
    amount: number;
    effectiveness: Effectiveness;
    isCrit: boolean;
}

export type GameEvent = DamageEvent | PokemonFainted | GameEnd;

export interface DamageEvent {
    key: 'damage';
    dealer: MovRef;
    target: PokemonRef;
    damage: Damage;
}

export interface PokemonFainted {
    key: 'pokemon_fainted';
    pokemon: PokemonRef;
}

export interface GameEnd {
    key: 'game_end';
    winner: PlayerId;
}

export type TurnHistory = GameEvent[];

export type GameHistory = TurnHistory[];

export interface GameRequest {
    payload: Payload;
    pokemonIdx: number;
    movIdx: number;
}

export type MovMap = {
    destructor: PokemonRef,
    other: number,
};

const pps = {
    "destructor": 32,
    "other": 16,
} satisfies { [M in MovKey]: number };

// export function getPP<M extends MovKey>(mov: M): number {
//     return pps[mov];
// }

export function mov(key: MovKey): Mov {
    return { key, pp: pps[key] };
}

export interface MultiTarget {
    targets: PokemonRef[];
}

export type MovKey = keyof MovMap;
export type Payload = { [Key in MovKey]: MovMap[Key] }[MovKey]
//export type Payload<T extends MovKey> = MovMap[T];

export interface Mov { key: MovKey, pp: number }

export interface Player {
    nickname: string;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: ValidatedRequest | null;
}

export interface ValidatedRequest extends GameRequest {
    priority: number;
}

export interface InGamePokemon {
    id: number;
    name: string | null;
    pokedexIdx: number;
    movs: Mov[];
    stats: Stats;
    hp: number;
}

export interface PlayerResponse {
    id: PlayerId;
    nickname: string;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: boolean;
}

export type BoardResponse = PlayerResponse[]; 