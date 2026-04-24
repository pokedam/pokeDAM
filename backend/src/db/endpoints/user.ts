import express from 'express';
import type { Request, Response, } from 'express';
import { rest } from '../client.js';
import type { User } from 'shared_types';

export async function get(userId: number): Promise<User> {
    return (await rest.get<User>(`/user/${userId}`)).data;
}

export const router = express.Router();

router.get('', async (req: Request, res: Response): Promise<void> => {
    res.json(await get(req.userId));
});

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
    res.json(await get(Number(req.params.userId)));
});