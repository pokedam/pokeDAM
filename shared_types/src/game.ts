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

type MovEntry<Payload> = {
    payload: Payload;
    pp: number;
};

type EnforceMovMap<M extends Record<string, MovEntry<unknown>>> = M;

type MovMap = EnforceMovMap<{
    destructor: {
        payload: SingleDamage;
        pp: 10;
    },
    other: {
        payload: number;
        pp: 10;
    };
}>;

export interface SingleDamage {
    player_idx: number;
    pokemon_idx: number;
}

export type Mov = keyof MovMap;
export type Payload<T extends Mov> = MovMap[T]['payload'];
