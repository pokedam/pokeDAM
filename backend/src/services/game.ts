import {
    getPP,
    type BoardResponse,
    type GameHistory,
    type GameRequest,
    type GameResponse,
    type GroupId,
    type Id,
    type InGamePokemon,
    type Mov,
    type Payload,
    type Player,
    type PlayerId,
    type PlayerResponse,
    type TurnHistory,
    type ValidatedRequest
} from "shared_types";

import * as store from "./store.js";
import FastPriorityQueue from "fastpriorityqueue";
import { db } from "../db/client.js";

const TURN_INTERVAL_MS = 60_000;

interface Timeout {
    id: GroupId;
    turn: number;
    time: number;
}

const heap = new FastPriorityQueue<Timeout>((a, b) => a.time < b.time);
let schedulerTimer: NodeJS.Timeout | null = null;


export interface Game {
    board: Map<PlayerId, Player>;
    history: GameHistory,
    turn: number;
}

export function gameToResponse(game: Game): GameResponse {
    return {
        type: 'game', board: Array.from(game.board).map(([id, player]) => ({
            id,
            pokemons: player.pokemons,
            actives: player.actives,
            request: player.request != null,
        }))
    };
}

interface ValidationContext<T extends Mov> {
    board: Map<PlayerId, Player>;
    playerId: number;
    payload: Payload<T>;
}

interface ExecutionContext<T extends Mov> extends ValidationContext<T> {
    history: TurnHistory;
}

type MovLogic = {
    [K in Mov]: {
        validate: (ctx: ValidationContext<K>) => number | null;
        execute: (ctx: ExecutionContext<K>) => void;
    };
};

export const movs: MovLogic = {
    destructor: {
        validate: (ctx): number | null => null,
        execute: (ctx): void => { }
    },
    other: {
        validate: (ctx): number | null => null,
        execute: (ctx): void => { }
    }
};



function play(id: PlayerId, request: GameRequest) {
    const gameId = store.games.id(id);
    if (!gameId) throw new Error(`Game not found`);

    const game = store.games.get(gameId);
    if (!game) throw new Error(`Game not found`);


    const player = game.board.get(id);
    if (!player) throw new Error(`Player not found on the board`);

    const pokemon = player.pokemons[request.pokemonIdx];
    if (!pokemon) throw new Error(`Pokemon not found`);

    const mov = pokemon.movs[request.movIdx];
    if (mov == null) throw new Error(`Move not found`);

    // const movPp = pokemon.pps[request.movIdx];
    // if (movPp == undefined) throw new Error(`Move PP not found`);
    if (mov.pp <= 0) throw new Error(`No PP left`);
    const ctx: ValidationContext<typeof mov.mov> = {
        board: game.board,
        playerId: id,
        payload: request.payload
    };

    const priority = validateRequest(mov.mov, ctx);
    if (priority === null) throw new Error(`Move validation failed`);

    player.request = { ...request, priority };

    for (const player of game.board.values()) {
        if (!player.request) return; // Wait for all players to submit their requests
    }

    processTurn(game, gameId);
}

function validateRequest<K extends Mov>(movKey: K, ctx: ValidationContext<K>): number | null {
    return movs[movKey].validate(ctx);
}

function executeRequest<K extends Mov>(movKey: K, ctx: ExecutionContext<K>) {
    movs[movKey].execute(ctx);
}


function init() {
    if (schedulerTimer) clearTimeout(schedulerTimer);
    const next = heap.peek();
    schedulerTimer = next ? setTimeout(processTimeouts, Math.max(0, next.time - Date.now())) : null;
}

async function create(playerId: Id): Promise<[GroupId, GameResponse]> {
    const groupId = store.lobbies.id(playerId);
    if (!groupId) throw new Error(`lobby not found`);

    const lobby = store.lobbies.get(groupId);
    if (!lobby) throw new Error(`Lobby not found`);

    const buildBoardEntry = async (playerId: PlayerId) => {
        const result = await db.user.getActivePokemons(playerId);
        const pokemons: InGamePokemon[] = result.map(pokemon => ({
            ...pokemon,
            movs: pokemon.movs.map(mov => ({ mov: mov, pp: getPP(mov) })),
            hp: pokemon.stats.hp,
        }));

        return {
            pokemons,
            actives: [pokemons[0] ?? null, pokemons[1] ?? null, pokemons[2] ?? null],
            request: null,
        };
    };

    const playerIds = [lobby.hostId, ...lobby.joiners.keys()];
    const boardArray: Player[] = await Promise.all(playerIds.map(playerId => buildBoardEntry(playerId)));
    const game: Game = {
        board: new Map(boardArray.map((data, idx) => [playerIds[idx]!, data])),
        history: [],
        turn: 0
    };
    store.games.set(game, groupId);

    return [groupId, gameToResponse(game)];
}

function processTurn(game: Game, id: GroupId) {
    game.turn += 1;

    const priorityQueue = new FastPriorityQueue<{
        request: ValidatedRequest;
        id: number;
    }>((a, b) => a.request.priority > b.request.priority);

    for (const [id, player] of game.board) {
        if (!player.request) continue;
        priorityQueue.add({ request: player.request, id });
    }

    let state: { request: ValidatedRequest; id: number } | undefined;
    let history: TurnHistory = [];
    while (state = priorityQueue.poll()) {
        let mov = (game.board.get(state.id)?.pokemons[state.request.pokemonIdx]?.movs[state.request.movIdx])!.mov;
        let payload = state.request.payload;
        let ctx: ExecutionContext<typeof mov> = {
            history,
            board: game.board,
            playerId: state.id,
            payload,
        };

        executeRequest(mov, ctx);
    }

    game.history.push(history);

    for (const state of game.board.values())
        state.request = null;

    // Recalculating "Date.now()" is necessary to avoid infinite queueing 
    // if the server has more games than it can process in a timely manner.
    heap.add({
        id,
        time: Date.now() + TURN_INTERVAL_MS,
        turn: game.turn,
    });
}

function processTimeouts(): void {
    schedulerTimer = null;
    let trigger: Timeout | undefined;
    while ((trigger = heap.peek()) && trigger.time <= Date.now()) {
        heap.poll();

        const game = store.games.get(trigger.id);

        if (!game || game.turn !== trigger.turn) {
            // Skip, this turn trigger was completed before timeout 
            // and another trigger is already queued
            continue;
        }

        processTurn(game, trigger.id);
    }

    init();
}

export const gameService = {
    init,
    create,
    play,
};
