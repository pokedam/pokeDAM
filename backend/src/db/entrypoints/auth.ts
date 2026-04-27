import express from 'express';
import type { Request, Response, } from 'express';
import { rest } from '../client.js';
import { jwt } from '../../jwt.js';
import { authFactory, type Auth, type LoginRequest } from 'shared_types';

export const router = express.Router();

router.post('/anonymous', async (_: Request, res: Response): Promise<void> => {
    const auth = (await rest.post<Auth>('/auth/anonymous')).data;
    res.json(authFactory.jwt(jwt.generate(auth.user.id), auth));
});

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    const tokenToRefresh = req.body.refreshToken;
    if (!tokenToRefresh) {
        res.status(400).json({ message: "No refresh token provided" });
        return;
    }
    const auth = (await rest.post<Auth>('/auth/refresh', tokenToRefresh, {
        headers: { 'Content-Type': 'text/plain' }
    })).data;
    res.json(authFactory.jwt(jwt.generate(auth.user.id), auth));
});


router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const loginRequest: LoginRequest = req.body;
    const auth = (await rest.post<Auth>('/auth/login', loginRequest)).data;
    res.json(authFactory.jwt(jwt.generate(auth.user.id), auth));
});