import type { GameHistory, GameRequest, Mov, Payload, TurnHistory } from "shared_types";
import { movs, type Board, type ExecutionContext, type ValidationContext } from "sim";
import type { GroupId, PlayerId } from "./store.js";
import * as store from "./store.js";
import FastPriorityQueue from "fastpriorityqueue";

const TURN_INTERVAL_MS = 60_000;

interface Timeout {
    id: GroupId;
    turn: number;
    time: number;
}

const heap = new FastPriorityQueue<Timeout>((a, b) => a.time < b.time);
let schedulerTimer: NodeJS.Timeout | null = null;

export interface Game {
    board: Board;
    states: Map<PlayerId, PlayerState>;
    history: GameHistory,
    turn: number;
}

interface PlayerState {
    request: ValidatedRequest | null;
    playerIdx: number;
}

interface ValidatedRequest {
    request: GameRequest;
    priority: number;
}

export function gameRequest(id: PlayerId, request: GameRequest) {
    const gameId = store.players.get(id);
    if (!gameId) throw new Error(`Game not found`);

    const game = store.games.get(gameId);
    if (!game) throw new Error(`Game not found`);

    const state = game.states.get(id);
    if (!state) throw new Error(`Player is not part of the game`);

    const player = game.board[state.playerIdx];
    if (!player) throw new Error(`Player not found on the board`);

    const pokemon = player.pokemons[request.pokemonIdx];
    if (!pokemon) throw new Error(`Pokemon not found`);

    const mov = pokemon.movs[request.movIdx];
    if (mov == null) throw new Error(`Move not found`);

    const movPp = pokemon.movsPp[request.movIdx];
    if (movPp == undefined) throw new Error(`Move PP not found`);
    if (movPp <= 0) throw new Error(`No PP left`);
    const ctx: ValidationContext<typeof mov> = {
        board: game.board,
        playerIdx: state.playerIdx,
        payload: request.payload
    };

    const priority = validateRequest(mov, ctx);
    if (priority === null) throw new Error(`Move validation failed`);

    state.request = { request, priority };

    for (const state of game.states.values()) {
        if (!state.request) return; // Wait for all players to submit their requests
    }

    processTurn(game, gameId);
}

function validateRequest<K extends Mov>(movKey: K, ctx: ValidationContext<K>): number | null {
    return movs[movKey].validate(ctx);
}

function executeRequest<K extends Mov>(movKey: K, ctx: ExecutionContext<K>) {
    movs[movKey].execute(ctx);
}


export function initTimeouts() {
    if (schedulerTimer) clearTimeout(schedulerTimer);
    const next = heap.peek();
    schedulerTimer = next ? setTimeout(processTimeouts, Math.max(0, next.time - Date.now())) : null;
}

function processTurn(game: Game, id: GroupId) {
    game.turn += 1;

    const priorityQueue = new FastPriorityQueue<{
        request: ValidatedRequest;
        playerIdx: number;
    }>((a, b) => a.request.priority > b.request.priority);

    for (const state of game.states.values()) {
        if (!state.request) continue;
        priorityQueue.add({ request: state.request, playerIdx: state.playerIdx });
    }

    let state: { request: ValidatedRequest; playerIdx: number } | undefined;
    let history: TurnHistory = [];
    while (state = priorityQueue.poll()) {
        let mov = (game.board[state.playerIdx]?.pokemons[state.request.request.pokemonIdx]?.movs[state.request.request.movIdx])!;
        let payload = state.request.request.payload;
        let ctx: ExecutionContext<typeof mov> = {
            history,
            board: game.board,
            playerIdx: state.playerIdx,
            payload,
        };

        executeRequest(mov, ctx);
    }

    game.history.push(history);

    for (const state of game.states.values())
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

    initTimeouts();
}

