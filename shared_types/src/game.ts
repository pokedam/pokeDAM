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
    payload: { [Key in Mov]: Payload<Key> }[Mov];
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
} satisfies { [M in Mov]: number };

export function getPP<M extends Mov>(mov: M): number {
    return pps[mov];
}

export interface SingleTarget {
    playerIdx: number;
    pokemonIdx: number;
}

export interface MultiTarget{
    targets: SingleTarget[];
}

export type Mov = keyof MovMap;
export type Payload<T extends Mov> = MovMap[T];

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
    movs: { mov: Mov, pp: number }[];
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