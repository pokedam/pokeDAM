import express from 'express';
import type { Request, Response, } from 'express';
import { db } from '../db/client.js';
import { checked } from './utils.js';

export const router = express.Router();

router.get('', async (req: Request, res: Response): Promise<void> => {
    checked(res, () => db.games.ofUser(req.userId));
});