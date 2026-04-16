const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { sequelize } = require('./config/Database');
const { router: authRouter, JWT_SECRET } = require('./controllers/AuthController');
const lobbyController = require('./controllers/LobbyController');

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

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        socket.userId = parseInt(decoded.sub, 10);
        next();
    });
});

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.userId} - Socket ${socket.id}`);
    lobbyController(io, socket);

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.userId}`);
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
}).catch(err => {
    console.error("Error sincronizando DB", err);
});
