import express from 'express';
import type { Request, Response, } from 'express';
import { db } from '../db/client.js';
import type { UserChangeRequest } from 'shared_types';
import { checked } from './utils.js';

export const router = express.Router();

router.get('', async (req: Request, res: Response): Promise<void> => {
    checked(res, () => db.user.get(req.userId));
});

router.get('/find/:userId', async (req: Request, res: Response): Promise<void> => {
    checked(res, () => db.user.get(Number(req.params.userId)));
});

router.patch('', async (req: Request, res: Response): Promise<void> => {
    const request: UserChangeRequest = req.body;
    checked(res, () => db.user.set(req.userId, request));
});

router.get('/pokemons', async (req: Request, res: Response): Promise<void> => {
    checked(res, () => db.user.getPokemons(req.userId));
});

router.patch('/pokemons', async (req: Request, res: Response): Promise<void> => {
    const request: (number | null)[] = req.body;
    checked(res, () => db.user.setPokemons(req.userId, request));
});

router.patch('/pokemons/:pokemonId', async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    checked(res, () => db.user.renamePokemon(req.userId, Number(req.params.pokemonId), name));
});