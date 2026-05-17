import {
    mov,
    type InGame,
    type GameHistory,
    type PlayRequest,
    type GroupId,
    type Id,
    type InGamePokemon,
    type MovKey,
    type MovMap,
    type MovRef,
    type PlayerId,
    type TurnHistory,
    pokemon as getPokemon,
    addStats,
    type GameGroupResponse,
    type GameEndEvent,
    type StartGamePlayer,
} from "shared_types";

import * as store from "./store.js";
import { db } from "../db/client.js";
import FastPriorityQueue from "fastpriorityqueue";
import { dealDamage, validateDamage } from "./sim.js";
import { MOV_MAP } from "./movs.js";


export interface Game {
    board: Map<PlayerId, Player>;
    history: GameHistory,
    turn: number;
}

export interface Player {
    start: StartGamePlayer,
    nickname: string;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: ValidatedRequest | null;
}
export interface ValidatedRequest extends PlayRequest {
    priority: number;
}

export interface TurnResult {
    groupId: GroupId,
    game: Game,
    history: TurnHistory,
    gameEnd: GameEndEvent | undefined,
}

export function gameToResponse(game: Game): InGame {
    return Array.from(game.board).map(([id, player]) => ({
        id,
        nickname: player.nickname,
        pokemons: player.pokemons,
        actives: player.actives,
        request: player.request != null,
    }));
}

interface ValidationContext<T> {
    board: Map<PlayerId, Player>;
    movRef: MovRef,
    payload: T;
}

interface ExecutionContext<T> extends ValidationContext<T> {
    history: TurnHistory;
}

export async function create(playerId: Id): Promise<GameGroupResponse> {
    const groupId = store.lobbies.id(playerId);
    if (!groupId) throw new Error(`lobby not found`);

    const lobby = store.lobbies.get(groupId);
    if (!lobby) throw new Error(`Lobby not found`);

    const buildBoardEntry = async (playerId: PlayerId): Promise<Player> => {
        console.log("Building board entry for player", playerId);
        const start = await db.user.getStartGamePlayer(playerId);
        console.log("Received pokemons from DB for player", playerId, start);
        const pokemons: InGamePokemon[] = start.pokemons.map(pokemon => {
            const stats = addStats(pokemon.iv, getPokemon(pokemon.pokedexIdx).statsBase);
            return {
                ...pokemon,
                stats,
                movs: pokemon.movs.map(key => mov(key)),
                hp: stats.hp,
            };
        });

        return {
            start,
            nickname: start.nickname,
            pokemons,
            actives: [pokemons[0] ?? null, pokemons[1] ?? null, pokemons[2] ?? null],
            request: null,
        };
    };

    const playerIds = [lobby.host.id, ...lobby.joiners.keys()];
    const boardArray: Player[] = await Promise.all(playerIds.map(playerId => buildBoardEntry(playerId)));
    const game: Game = {
        board: new Map(boardArray.map((data, idx) => [playerIds[idx]!, data])),
        history: [],
        turn: 0
    };
    store.games.set(game, groupId);
    return {
        id: groupId,
        board: gameToResponse(game),
    };
}

export function play(id: PlayerId, request: PlayRequest): TurnResult | undefined {
    const gameId = store.games.id(id);
    if (!gameId) throw new Error(`Game not found`);

    const game = store.games.get(gameId);
    if (!game) throw new Error(`Game not found`);


    const player = game.board.get(id);
    if (!player) throw new Error(`Player not found on the board`);

    const pokemon = player.actives[request.pokemonIdx];
    if (!pokemon) throw new Error(`Pokemon not found`);

    const mov = pokemon.movs[request.movIdx];
    if (mov == null) throw new Error(`Move not found`);

    // const movPp = pokemon.pps[request.movIdx];
    // if (movPp == undefined) throw new Error(`Move PP not found`);
    if (mov.pp <= 0) throw new Error(`No PP left`);
    const ctx: ValidationContext<MovMap[typeof mov.key]> = {
        board: game.board,
        movRef: {
            playerId: id,
            pokemonIdx: request.pokemonIdx,
            movIdx: request.movIdx,
        },
        payload: request.payload
    };

    const priority = validateRequest(mov.key, ctx);

    player.request = { ...request, priority };

    for (const p of game.board.values())
        if (p.actives.find(p => p && p.hp > 0)) {
            console.log(p.nickname, 'is active');
            if (!p.request || !p.request.isReady) {
                console.log("and his request is not ready, waiting: ", p.request);
                return;
            }
        }


    return processTurn(game, gameId);
}

export function processTurn(game: Game, id: GroupId): TurnResult {
    game.turn += 1;

    const priorityQueue = new FastPriorityQueue<{
        request: ValidatedRequest;
        id: number;
    }>((a, b) => a.request.priority > b.request.priority);

    for (const [id, player] of game.board) {
        if (!player.request)
            continue;

        priorityQueue.add({ request: player.request, id });
    }

    let state: { request: ValidatedRequest; id: number } | undefined;
    let history: TurnHistory = [];
    while (state = priorityQueue.poll()) {
        let mov = (game.board.get(state.id)?.pokemons[state.request.pokemonIdx]?.movs[state.request.movIdx])!.key;
        let payload = state.request.payload;
        let ctx: ExecutionContext<MovMap[typeof mov]> = {
            history,
            board: game.board,
            movRef: {
                movIdx: state.request.movIdx,
                playerId: state.id,
                pokemonIdx: state.request.pokemonIdx,
            },
            payload,
        };

        executeRequest(mov, ctx);
    }

    const gameEnd = isGameCompleted(game);
    if (gameEnd) store.games.delete(id);
    else for (const state of game.board.values())
        state.request = null;

    game.history.push(history);

    return {
        groupId: id,
        history,
        game,
        gameEnd,
    };


}

function isGameCompleted(game: Game): GameEndEvent | undefined {
    const alive = Array.from(game.board.entries()).filter(([_, val]) => {
        for (const pokemon of val.actives)
            if (pokemon && pokemon.hp > 0)
                return true;

        return false;
    });

    if (alive.length > 1) return;

    return { winner: alive[0]?.[0] ?? null }

}

function validateRequest<K extends MovKey>(movKey: K, ctx: ValidationContext<MovMap[K]>): number {
    return MOV_MAP[movKey].validate(ctx);
}

function executeRequest<K extends MovKey>(movKey: K, ctx: ExecutionContext<MovMap[K]>) {
    MOV_MAP[movKey].execute(ctx);
}
