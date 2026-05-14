import { Stats } from "./pokemon";

export type Effectiveness = 4 | 2 | 1 | 0.5 | 0.25 | 0;

export type PlayerId = number;
export type GroupId = string;
export type Id = PlayerId | GroupId;

export interface Damage {
    amount: number;
    effectiveness: Effectiveness;
    isCrit: boolean;
}

export type GameEvent = DamageEvent | PokemonFainted;

export interface DamageEvent {
    key: 'damage';
    dealer_player: number;
    dealer_pokemon: number;
    target_player: number;
    target_pokemon: number;
    damage: Damage;
}

export interface PokemonFainted {
    key: 'pokemon_fainted';
    player_idx: number;
    pokemon_idx: number;
}

export type TurnHistory = GameEvent[];

export type GameHistory = TurnHistory[];

export interface GameRequest {
    payload: { [Key in MovKey]: Payload<Key> }[MovKey];
    pokemonIdx: number;
    movIdx: number;
}

type MovMap = {
    destructor: SingleTarget,
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

export interface SingleTarget {
    playerIdx: number;
    pokemonIdx: number;
}

export interface MultiTarget {
    targets: SingleTarget[];
}

export type MovKey = keyof MovMap;
export type Payload<T extends MovKey> = MovMap[T];

export interface Mov { key: MovKey, pp: number }

export interface Player {
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: ValidatedRequest | null;
}

export interface ValidatedRequest extends GameRequest {
    priority: number;
}

export interface InGamePokemon {
    id: number;
    pokedexIdx: number;
    movs: Mov[];
    stats: Stats;
    hp: number;
}

export interface PlayerResponse {
    id: PlayerId;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: boolean;
}

export type BoardResponse = PlayerResponse[];