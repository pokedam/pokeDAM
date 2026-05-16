import { GameEndEvent } from "./lobby";
import { Stats } from "./pokemon";

export type Effectiveness = 4 | 2 | 1 | 0.5 | 0.25 | 0;

export type PlayerId = number;
export type GroupId = string;
export type Id = PlayerId | GroupId;

// Refers to a pokemon in the game, 
// identified by the player it belongs to and its index in that player's team
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

export type GameEvent = DamageEvent | PokemonFainted;

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

export type TurnHistory = GameEvent[];

export type GameHistory = TurnHistory[];

export interface PlayRequest {
    payload: Payload;
    pokemonIdx: number;
    movIdx: number;
}


// Collection of {key: payload} pairs describing all the movs in the game.
export type MovMap = {
    destructor: PokemonRef,
    other: number,
};


// Collection of {key: number} pairs describing the PP amount for each mov.
const pps = {
    "destructor": 32,
    "other": 16,
} satisfies { [M in MovKey]: number };

export function mov(key: MovKey): Mov {
    return { key, pp: pps[key] };
}

export type MovKey = keyof MovMap;

// Message to be sent to the server describing the mov.
export type Payload = { [Key in MovKey]: MovMap[Key] }[MovKey]

export interface Mov { key: MovKey, pp: number }

export interface InGamePokemon {
    id: number;
    name: string | null;
    pokedexIdx: number;
    movs: Mov[];
    stats: Stats;
    hp: number;
}

export interface StartGamePokemon {
    id: number;
    name: string | null;
    pokedexIdx: number;
    movs: MovKey[];
    iv: Stats;
}

export interface InGamePlayer {
    id: PlayerId;
    nickname: string;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: boolean;
}

export interface StartGamePlayer {
    nickname: string;
    pokemons: StartGamePokemon[];
}

export interface SummaryGamePlayer extends StartGamePlayer {
    id: PlayerId;
}

export type StartGame = StartGamePlayer[];
export type SummaryGame = SummaryGamePlayer[];
export type InGame = InGamePlayer[];

export interface GameSummary {
    date?: number,
    initialGame: SummaryGame,
    history: GameHistory,
    end: GameEndEvent,
}