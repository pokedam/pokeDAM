import express from 'express';
import type { Request, Response, } from 'express';
import { db } from '../db/client.js';
import { checked } from './utils.js';

export const router = express.Router();

router.post('/anonymous', async (_: Request, res: Response) => {
    await checked(res, db.auth.anonymous);
});

router.post('/refresh', async (req: Request, res: Response) => {
    await checked(res, () => db.auth.refresh(req.body.refreshToken));
});

router.post('/login', async (req: Request, res: Response) => {
    await checked(res, () => db.auth.login(req.body));
});