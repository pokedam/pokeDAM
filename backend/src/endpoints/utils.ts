import { result, type Result } from "shared_types";
import type { Response } from "express";

export async function checked<T = any>(res: Response<T | string>, callback: (() => Promise<T>)): Promise<void> {
    try {
        res.json(await callback());
    } catch (err: any) {
        let e = result.err(err);
        res.status(e.status).json(e.message);
    }
}