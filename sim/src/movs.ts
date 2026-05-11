import { Mov, Movs, SingleDamage } from "shared_types";

export type MovExecutors = {
    [K in Movs]: (args: Mov<K>) => Promise<void>;
};

const executors: MovExecutors = {
    destructor: (args: SingleDamage): Promise<void> => {
        throw new Error("Function not implemented.");
    }
};

