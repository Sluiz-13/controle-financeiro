"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Verifica se o email já existe
        const existingUser = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: 'Email já registrado' });
            return;
        }
        // Criptografa a senha
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Insere no banco de dados
        const newUser = yield db_1.default.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword]);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET não está definido');
        }
        const token = jsonwebtoken_1.default.sign({ id: newUser.rows[0].id }, jwtSecret, { expiresIn: '1d' });
        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: {
                id: newUser.rows[0].id,
                name: newUser.rows[0].name,
                email: newUser.rows[0].email,
            },
            token,
        });
    }
    catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Verifica se o usuário existe
        const userResult = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        const user = userResult.rows[0];
        console.log('Attempting login for email:', email);
        console.log('Password received:', password);
        console.log('Hashed password from DB:', user.password);
        // Verifica a senha
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        console.log('Password match result:', passwordMatch);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Senha incorreta' });
            return;
        }
        // Gera o token JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET não está definido');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, jwtSecret, { expiresIn: '1d' });
        res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    }
    catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.login = login;
