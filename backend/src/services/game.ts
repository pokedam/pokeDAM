import type { GameHistory, MovPayload } from "shared_types";
import type { Board } from "sim";
import type { GroupId, PlayerId } from "./store.js";
import * as store from "./store.js";
import FastPriorityQueue from "fastpriorityqueue";

const TURN_INTERVAL_MS = 60_000;

interface HeapItem {
    id: GroupId;
    nextTurnAt: number;
}

const heap = new FastPriorityQueue<HeapItem>((a, b) => a.nextTurnAt < b.nextTurnAt);
let schedulerTimer: NodeJS.Timeout | null = null;

export interface Game {
    board: Board;
    requests: Map<PlayerId, PlayerStatus>;
    history: GameHistory,
    turn: number;
}

export interface PlayerStatus {
    player_idx: number;
    payload: MovPayload | null;
}

export function schedule(){
    if(schedulerTimer) clearTimeout(schedulerTimer);
    const next = heap.peek();
    schedulerTimer = next ? setTimeout(run, Math.max(0, next.nextTurnAt - Date.now())) : null;
}

function run(): void {
    schedulerTimer = null;
    const now = Date.now();
    let item: HeapItem | undefined;
    while((item = heap.peek()) && item.nextTurnAt <= now) {
        heap.poll();

        const game = store.games.get(item.id); 
        if(!game) throw new Error(`Game with id ${item.id} not found`);

        game.turn += 1;
        
        // TODO: Advance turn
        // If the game has ended, return AND DON'T RESCHEDULE. 

        // Clear requests
        for(const status of game.requests.values())
            status.payload = null;
         
        heap.add({id: item.id, nextTurnAt: item.nextTurnAt + TURN_INTERVAL_MS});
    }

    schedule();
}