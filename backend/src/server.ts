import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import { sequelize } from './config/Database.js';
import { authRouter, JWT_SECRET } from './controllers/AuthController.js';
import { lobbyController } from './controllers/LobbyController.js';

// Configuración básica
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS EXPRESS (REST)
// ==========================================
app.use('/auth', authRouter); // Exactos endpoints de Java: /auth/anonymous, /auth/user, /auth/refresh

// ==========================================
// WEBSOCKETS (Socket.IO)
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    // IDÉNTICO AL HEARTBEAT DE SPRING BOOT: new long[] { 10000, 10000 }
    pingInterval: 10000, // Cada 10s el servidor hará ping
    pingTimeout: 10000   // Si no hay pong en 10s se desconecta
});

// Middleware de Autenticación para WebSockets
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token as string, JWT_SECRET, (err, decoded: any) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        (socket as any).userId = parseInt(decoded.sub as string, 10);
        next();
    });
});

io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`Usuario conectado: ${userId} - Socket ${socket.id}`);
    lobbyController(io, socket);

    socket.on('disconnect', () => {
        // Podríamos invocar a lobbyService.leave(userId) aquí si fuese necesario
        console.log(`Usuario desconectado: ${userId}`);
    });
});

// ==========================================
// ARRANCAR EL SERVIDOR
// ==========================================
sequelize.sync().then(() => {
    console.log("Base de datos en memoria (SQLite) sincronizada tipo H2.");
    server.listen(PORT, () => {
        console.log(`Servidor REST y WebSocket corriendo en http://localhost:${PORT}`);
    });
}).catch((err: any) => {
    console.error("Error sincronizando DB", err);
});