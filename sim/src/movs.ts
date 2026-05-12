import { Mov, Payload, TurnHistory } from "shared_types";
import { Board } from ".";

export interface ValidationContext<T extends Mov> {
    board: Board;
    playerIdx: number;
    payload: Payload<T>;
}

export interface ExecutionContext<T extends Mov> extends ValidationContext<T> {
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
