import type { Result } from "shared_types";
import type { Response } from "express";

export function send<T = any>(res: Response<T | string>, result: Result<T>,) {
    if (result.success) {
        let a = result.content;
        res.json(a);
    } else {
        res.status(result.status ?? 500).json(result.message);
    }
}