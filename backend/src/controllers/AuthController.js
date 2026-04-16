const express = require('express');
const router = express.Router();
const { User } = require('../config/Database');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_para_jwt_aqui_va';

function generateToken(userId) {
    return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: '1h' });
}

function generateRefreshToken() {
    return uuidv4();
}

// Middleware de Autenticación de Express (Equivalente al JwtAuthenticationFilter)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(401);
        req.user = { id: parseInt(decoded.sub, 10) };
        next();
    });
};

// @PostMapping("/anonymous")
router.post('/anonymous', async (req, res) => {
    let user = await User.create({});
    
    user.nickname = `Trainer${String(user.id).padStart(4, '0')}`;
    user.refreshToken = generateRefreshToken();
    
    await user.save();

    res.json({
        idToken: generateToken(user.id),
        user: user
    });
});

// @GetMapping("/user")
router.get('/user', authenticateToken, async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send();
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).send();

    res.json(user);
});

// @GetMapping("/user/{userId}")
router.get('/user/:userId', async (req, res) => {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).send();

    res.json(user);
});

// @PostMapping("/user")
router.post('/user', authenticateToken, async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send();
    }

    const { nickname } = req.body;
    let user = await User.findByPk(req.user.id);
    
    if (!user) return res.status(404).send();

    if (nickname) {
        user.nickname = nickname;
        await user.save();
    }

    res.json(user);
});

// @PostMapping("/refresh")
router.post('/refresh', async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) return res.status(400).send();

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

module.exports = { router, authenticateToken, JWT_SECRET, generateRefreshToken };