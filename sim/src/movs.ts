import { Mov, Payload, TurnHistory } from "shared_types";
import { Board } from ".";

export interface ValidationContext<T extends Mov> {
    board: Board;
    playerIdx: number;
    payload: Payload<T>;
}

interface ExecutionContext<T extends Mov> extends ValidationContext<T> {
    history: TurnHistory;
}

export type MovLogic = {
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
        validate: function (ctx): number | null {
            throw new Error("Function not implemented.");
        },
        execute: function (ctx: ExecutionContext<"other">): void {
            throw new Error("Function not implemented.");
        }
    }
};
