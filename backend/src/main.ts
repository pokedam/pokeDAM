import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { sanitizer } from './sanitizer.js';
import { jwt } from './jwt.js';
import { socketsController } from './sockets.js';
import * as endpoints from './endpoints/index.js';
import * as gameService from './services/game.js';

// =============
// EXPRESS
// =============
// Server configuration
const app = express();
app.use(cors());
app.use(express.json());
app.use(sanitizer.middleware);

// Endpoints
app.use('/auth', endpoints.auth);
app.use('/user', jwt.middleware, endpoints.user);
app.use('/games', jwt.middleware, endpoints.games);
// Server inicialization
const server = http.createServer(app);

// =============
// SOCKETS
// =============
// Socket.io configuration
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingInterval: 10000,
    pingTimeout: 10000
});

// Socket Middlewares
io.use(sanitizer.socketMiddleware);
io.use(jwt.socketMiddleware);

io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socketsController(io, userId, socket);
});

// =============
// INIT SERVER
// =============
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor REST y WebSocket corriendo en http://localhost:${PORT}`);
});