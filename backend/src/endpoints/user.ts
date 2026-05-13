import express from 'express';
import type { Request, Response, } from 'express';
import { send } from './utils.js';
import { dbService } from '../db/client.js';
import type { UserChangeRequest } from 'shared_types';

export const router = express.Router();

router.get('', async (req: Request, res: Response): Promise<void> => {
    send(res, await dbService.user.get(req.userId));
});

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
    send(res, await dbService.user.get(Number(req.params.userId)));
});


router.patch('', async (req: Request, res: Response): Promise<void> => {
    const request: UserChangeRequest = req.body;
    send(res, await dbService.user.set(req.userId, request));
});

// router.get('/pokemons', async (req: Request, res: Response): Promise<void> => {
//     checked(res, () => db.user.getPokemons(req.userId));
// });

// router.patch('/pokemons', async (req: Request, res: Response): Promise<void> => {
//     const request: number[] = req.body;
//     checked(res, () => db.user.setPokemons(req.userId, request));
// });
