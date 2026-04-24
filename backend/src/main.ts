import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

//import { authRouter } from './auth.js';
import { sanitizer } from './sanitizer.js';
import { jwt } from './jwt.js';
import { lobbyController } from './lobby/lobby.controller.js';
import { dbService as db } from './db/client.js';

// Server configuration
const app = express();
app.use(cors());
app.use(express.json());
app.use(sanitizer.middleware);

app.use('/auth', db.auth.router);
app.use('/user', jwt.middleware, db.user.router);


//Server inicialization
const server = http.createServer(app);

//Socket.io configuration
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
    lobbyController(io, userId, socket);
});

// ==========================================
// ARRANCAR EL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor REST y WebSocket corriendo en http://localhost:${PORT}`);
});