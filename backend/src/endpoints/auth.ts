import express from 'express';
import type { Request, Response, } from 'express';
import { dbService } from '../db/client.js';
import { send } from './utils.js';
import type { LoginRequest } from 'shared_types';

export const router = express.Router();

router.post('/anonymous', async (_: Request, res: Response) => {
    send(res, await dbService.auth.anonymous());
});

router.post('/refresh', async (req: Request, res: Response) => {
    const token = req.body.refreshToken;
    send(res, await dbService.auth.refresh(token));
});

router.post('/login', async (req: Request, res: Response) => {
    const loginRequest: LoginRequest = req.body;
    send(res, await dbService.auth.login(loginRequest));
});