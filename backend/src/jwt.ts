
import type { Request, Response, NextFunction } from 'express';
import coreJwt from 'jsonwebtoken';

export const jwt = {
    socketMiddleware,
    middleware,
    generate,
};

const SECRET = process.env.JWT_SECRET || fallbackJwt();
const EXPIRE_TIME_SECS = 60 * 15;

function fallbackJwt(): string {
    const jwt = 'mi_secreto_super_seguro_para_jwt_aqui_va';
    console.warn(`[WARNING] process.env.JWT_SECRET is not defined. Using dev fallback.`);
    return jwt;
}

// Middleware para Socket.IO
function socketMiddleware(socket: any, next: (err?: any) => void) {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }
    coreJwt.verify(token as string, SECRET, (err, decoded: any) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        (socket as any).userId = parseInt(decoded.sub as string, 10);
        next();
    });
}


// Extender el tipo de Request de Express para incluir nuestro usuario autenticado
declare global {
    namespace Express {
        interface Request {
            userId: number,
        }
    }
}

function middleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    coreJwt.verify(token, SECRET, (err, decoded: any) => {
        if (err) {
            res.sendStatus(401);
            return;
        }

        req.userId = parseInt(decoded.sub as string, 10);
        next();
    });
};


function generate(userId: number): string {
    return coreJwt.sign({ sub: String(userId) }, SECRET, { expiresIn: EXPIRE_TIME_SECS }); //
}

