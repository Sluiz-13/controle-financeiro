"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Verifica se existe um token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET não está definido');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
            req.user = { id: decoded.id }; // salva o id do usuário para uso nas próximas rotas
        }
        else {
            res.status(403).json({ error: 'Token inválido ou expirado' });
            return;
        }
        next(); // segue para o próximo passo (ex: controller)
    }
    catch (error) {
        res.status(403).json({ error: 'Token inválido ou expirado' });
        return;
    }
};
exports.default = verifyToken;
