
import type { Request, Response, NextFunction } from 'express';
import coreJwt from 'jsonwebtoken';

export const jwt = {
    socketMiddleware,
    middleware,
    generate,
};

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_para_jwt_aqui_va';

// Middleware para Socket.IO
function socketMiddleware(socket: any, next: (err?: any) => void) {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }
    coreJwt.verify(token as string, JWT_SECRET, (err, decoded: any) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        (socket as any).userId = parseInt(decoded.sub as string, 10);
        next();
    });
}

function middleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    coreJwt.verify(token, JWT_SECRET, (err, decoded: any) => {
        if (err) {
            res.sendStatus(401);
            return;
        }

        req.user = { id: parseInt(decoded.sub as string, 10) };
        next();
    });
};


function generate(userId: number): string {
    return coreJwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: '1h' });
}

