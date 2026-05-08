import type { Request, Response, NextFunction } from 'express';
import xss from 'xss';

export const sanitizer = {
    middleware: middleware,
    socketMiddleware: socketMiddleware,
};

// Función recursiva para sanear objetos, arrays y strings
function sanitize(input: any): any {
    if (typeof input === 'string') {
        return xss(input);
    } else if (Array.isArray(input)) {
        return input.map(sanitize);
    } else if (input !== null && typeof input === 'object') {
        const sanitized: any = {};
        for (const key in input) {
            sanitized[key] = sanitize(input[key]);
        }
        return sanitized;
    }
    return input;
}

// Middleware para Express
function middleware(req: Request, res: Response, next: NextFunction) {
    req.body = sanitize(req.body);
    for (const key in req.query) {
        req.query[key] = sanitize(req.query[key]);
    }
    next();
}

// Middleware para Socket.IO
function socketMiddleware(socket: any, next: (err?: any) => void) {
    if (socket.handshake && socket.handshake.auth) {
        socket.handshake.auth = sanitize(socket.handshake.auth);
    }
    if (socket.handshake && socket.handshake.query) {
        socket.handshake.query = sanitize(socket.handshake.query);
    }
    next();
}
