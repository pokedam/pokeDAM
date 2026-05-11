import { PlayerPokemon } from "./pokemon";

interface MovMap {
    'destructor': SingleDamage;
    'other': SingleDamage,
}

export interface SingleDamage {
    player_idx: number;
    pokemon_idx: number;
    damage: number;
}

export type Movs = keyof MovMap;
export type Mov<T extends Movs> = MovMap[T];

export type MovPayload = {
    [K in keyof MovMap]: {
        name: K;
        payload: MovMap[K];
    }
}[keyof MovMap];


export interface MovRequest{
    payload: MovPayload;
    turn: number;
}