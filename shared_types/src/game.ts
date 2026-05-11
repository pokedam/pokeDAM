import { PlayerPokemon } from "./pokemon";

interface MovMap {
    'destructor': SingleDamage;
}

export interface SingleDamage {
    player_idx: number;
    pokemon_idx: number;
    damage: number;
}

export type Movs = keyof MovMap;
export type Mov<T extends Movs> = MovMap[T];



export type ActionPayload = {
    [K in Movs]: { name: K; mov: Mov<K> }
};

export interface Game {
    players: InGamePlayer[];
}

export interface InGamePlayer {

    pokemons: InGamePokemon[];
}

export interface InGamePokemon {
    pokemon: PlayerPokemon;
    hp: number;
}

type MovBuilders = {
    [K in Movs]: () => Mov<K>;
};

const creators: MovBuilders = {
    destructor: (): SingleDamage => {
        throw new Error("Function not implemented.");
    }
};


type MovExecutors = {
    [K in Movs]: (args: Mov<K>) => Promise<void>;
};

const executors: MovExecutors = {
    destructor: (args: SingleDamage): Promise<void> => {
        throw new Error("Function not implemented.");
    }
};