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
exports.createDepartment = exports.getDepartments = void 0;
const db_1 = __importDefault(require("../config/db"));
// Listar departamentos do usuário
const getDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = req.user.id;
    try {
        const query = `SELECT * FROM departments WHERE user_id = $1 AND is_active = TRUE ORDER BY name`;
        const { rows } = yield db_1.default.query(query, [userId]);
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao buscar departamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar departamentos' });
    }
});
exports.getDepartments = getDepartments;
// Criar novo departamento
const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = req.user.id;
    const { name } = req.body;
    try {
        const query = `INSERT INTO departments (name, user_id) VALUES ($1, $2) RETURNING *`;
        const { rows } = yield db_1.default.query(query, [name, userId]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        console.error('Erro ao criar departamento:', error);
        res.status(500).json({ error: 'Erro ao criar departamento' });
    }
});
exports.createDepartment = createDepartment;
