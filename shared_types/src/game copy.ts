import { PlayerPokemon } from "./pokemon";

interface MovMap {
    'destructor': SingleTarget;
    'rayo': SingleTarget;
    'ataque-rapido': SingleTarget;
    'surf': MultiTarget;
    'hidrobomba': SingleTarget;
    'lanzallamas': SingleTarget;
    'velocidad-extrema': SingleTarget;
}

export interface SingleTarget {
    player_idx: number;
    pokemon_idx: number;
}

export interface MultiTarget {
    targets: SingleTarget[];
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


// Frontend
type MovBuilders = {
    [K in Movs]: () => Mov<K>;
};

// const creators: MovBuilders = {
//     destructor: (): SingleTarget => {
//         throw new Error("Function not implemented.");
//     }
// };


// Backend
type MovExecutors = {
    [K in Movs]: (args: Mov<K>) => Promise<void>;
};

// const executors: MovExecutors = {
//     destructor: (args: SingleTarget): Promise<void> => {
//         throw new Error("Function not implemented.");
//     },
// };