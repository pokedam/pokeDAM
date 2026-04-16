import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../config/Database.js';

const router = express.Router();

export const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_para_jwt_aqui_va';

export function generateToken(userId: number): string {
    return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: '1h' });
}

export function generateRefreshToken(): string {
    return uuidv4();
}

// Extender el tipo de Request de Express para incluir nuestro usuario autenticado
declare global {
    namespace Express {
        interface Request {
            user?: { id: number };
        }
    }
}

// Middleware de Autenticación de Express (Equivalente al JwtAuthenticationFilter)
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
        if (err) {
            res.sendStatus(401);
            return;
        }
        
        req.user = { id: parseInt(decoded.sub as string, 10) };
        next();
    });
};

// @PostMapping("/anonymous")
router.post('/anonymous', async (req: Request, res: Response): Promise<void> => {
    let user = await User.create({
        refreshToken: generateRefreshToken(),
        nickname: null
    });
    
    user.nickname = `Trainer${String(user.id).padStart(4, '0')}`;
    await user.save();

    res.json({
        idToken: generateToken(user.id),
        user: user
    });
});

// @GetMapping("/user")
router.get('/user', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        res.status(401).send();
        return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
        res.status(404).send();
        return;
    }

    res.json(user);
});

// @GetMapping("/user/{userId}")
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
    const user = await User.findByPk(Number(req.params.userId));
    if (!user) {
        res.status(404).send();
        return;
    }

    res.json(user);
});

// @PostMapping("/user")
router.post('/user', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        res.status(401).send();
        return;
    }

    const { nickname } = req.body;
    let user = await User.findByPk(req.user.id);
    
    if (!user) {
        res.status(404).send();
        return;
    }

    if (nickname) {
        user.nickname = nickname;
        await user.save();
    }

    res.json(user);
});

// @PostMapping("/refresh")
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        res.status(400).send();
        return;
    }

    const user = await User.findOne({ where: { refreshToken: refresh_token } });

    if (user) {
        const newIdToken = generateToken(user.id);
        const newRefreshToken = generateRefreshToken();

        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            idToken: newIdToken,
            user: user
        });
    } else {
        res.status(400).send();
    }
});

export { router as authRouter };
