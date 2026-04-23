import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { sequelize } from './database.js';
import { authRouter } from './auth.js';
import { sanitizer } from './sanitizer.js';
import { jwt } from './jwt.js';
import { lobbyController } from './lobby/lobby.controller.js';

// Server configuration
const app = express();
app.use(cors());
app.use(express.json());
// Middleware de sanitización para todas las peticiones REST
app.use(sanitizer.middleware);
app.use('/auth', authRouter); // Exactos endpoints de Java: /auth/anonymous, /auth/user, /auth/refresh

//Server inicialization
const server = http.createServer(app);

//Socket.io configuration
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    // IDÉNTICO AL HEARTBEAT DE SPRING BOOT: new long[] { 10000, 10000 }
    pingInterval: 10000, // Cada 10s el servidor hará ping
    pingTimeout: 10000   // Si no hay pong en 10s se desconecta
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

// Initializa base de datos
await sequelize.sync();

server.listen(PORT, () => {
    console.log(`Servidor REST y WebSocket corriendo en http://localhost:${PORT}`);
});

// sequelize.sync().then(() => {
//     console.log("Base de datos en memoria (SQLite) sincronizada tipo H2.");
//     server.listen(PORT, () => {
//         console.log(`Servidor REST y WebSocket corriendo en http://localhost:${PORT}`);
//     });
// }).catch((err: any) => {
//     console.error("Error sincronizando DB", err);
// });