export type Effectiveness = 4 | 2 | 1 | 0.5 | 0.25 | 0;

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
    destructor: SingleDamage,
    other: number,
};

const pps = {
    "destructor": 32,
    "other": 16,
} satisfies { [M in Mov]: number };

export function getPP<M extends Mov>(mov: M): number {
    return pps[mov];
}

export interface SingleDamage {
    playerIdx: number;
    pokemonIdx: number;
}

export type Mov = keyof MovMap;
export type Payload<T extends Mov> = MovMap[T];
