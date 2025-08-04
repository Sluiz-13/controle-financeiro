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
exports.updateSaving = exports.deleteSaving = exports.getSavingsSummary = exports.createSaving = exports.getAllSavings = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAllSavings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    const savings = yield prisma_1.default.saving.findMany({
        where: { user_id: userId },
        orderBy: { date: 'desc' },
    });
    res.json(savings);
});
exports.getAllSavings = getAllSavings;
const createSaving = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    const { amount, description, date } = req.body;
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: 'Valor inválido.' });
    }
    const newSaving = yield prisma_1.default.saving.create({
        data: {
            user_id: userId,
            amount,
            description: description || null,
            date: date ? new Date(date) : new Date(),
        },
    });
    res.status(201).json(newSaving);
});
exports.createSaving = createSaving;
const getSavingsSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    const result = yield prisma_1.default.$queryRaw `
    SELECT
      TO_CHAR(date, 'YYYY-MM') AS month,
      SUM(amount) AS total
    FROM "Saving"
    WHERE user_id = ${userId}
    GROUP BY month
    ORDER BY month ASC
  `;
    res.json(result);
});
exports.getSavingsSummary = getSavingsSummary;
const deleteSaving = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    const { id } = req.params;
    try {
        yield prisma_1.default.saving.delete({
            where: { id: Number(id), user_id: userId },
        });
        res.status(200).json({ message: 'Economia deletada com sucesso.' });
    }
    catch (error) {
        res.status(404).json({ message: 'Economia não encontrada.' });
    }
});
exports.deleteSaving = deleteSaving;
const updateSaving = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    const { id } = req.params;
    const { amount, description, date } = req.body;
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: 'Valor inválido.' });
    }
    try {
        const updatedSaving = yield prisma_1.default.saving.update({
            where: { id: Number(id), user_id: userId },
            data: {
                amount,
                description: description || null,
                date: date ? new Date(date) : new Date(),
            },
        });
        res.status(200).json(updatedSaving);
    }
    catch (error) {
        res.status(404).json({ message: 'Economia não encontrada.' });
    }
});
exports.updateSaving = updateSaving;
