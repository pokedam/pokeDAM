import express from 'express';
import type { Request, Response, } from 'express';
import { send } from './utils.js';
import { db } from '../db/client.js';
import type { UserChangeRequest } from 'shared_types';

export const router = express.Router();

router.get('', async (req: Request, res: Response): Promise<void> => {
    send(res, await db.user.get(req.userId));
});

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
    send(res, await db.user.get(Number(req.params.userId)));
});


router.patch('', async (req: Request, res: Response): Promise<void> => {
    const request: UserChangeRequest = req.body;
    send(res, await db.user.set(req.userId, request));
});