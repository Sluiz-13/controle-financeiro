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
exports.getFinancialSummary = exports.getSummaryByDepartment = exports.isValidDepartment = exports.getMonthlyResume = exports.getByDepartment = exports.getMonthlySummary = exports.getTransactionsByDepartment = exports.deleteTransaction = exports.updateTransaction = exports.getTransactionSummary = exports.getTransactions = exports.createTransaction = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const { title, amount, type, date, department } = req.body;
    const userId = Number(req.user.id);
    if (!title || !amount || !type || !date) {
        return res.status(400).json({ error: "Campos obrigatórios: title, amount, type e date" });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
        return res.status(400).json({ error: "O valor da transação (amount) deve ser um número válido." });
    }
    try {
        if (department) {
            const departmentExists = yield isValidDepartment(department, userId);
            if (!departmentExists) {
                yield prisma_1.default.department.create({
                    data: { name: department, user_id: userId },
                });
            }
        }
        const newTransaction = yield prisma_1.default.transaction.create({
            data: {
                title,
                amount: parsedAmount,
                type,
                date: new Date(date),
                department: department || null,
                user_id: userId,
            },
        });
        res.status(201).json(newTransaction);
    }
    catch (error) {
        console.error("Erro ao criar transação", error);
        res.status(500).json({ error: "Erro interno ao criar transação" });
    }
});
exports.createTransaction = createTransaction;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    try {
        const { month, year, type, department } = req.query;
        const where = { user_id: userId };
        if (type) {
            where.type = type;
        }
        if (department) {
            where.department = department;
        }
        if (month && year) {
            where.date = {
                gte: new Date(Number(year), Number(month) - 1, 1),
                lt: new Date(Number(year), Number(month), 1),
            };
        }
        else if (year) {
            where.date = {
                gte: new Date(Number(year), 0, 1),
                lt: new Date(Number(year) + 1, 0, 1),
            };
        }
        const transactions = yield prisma_1.default.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
        });
        res.json(transactions);
    }
    catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro interno ao buscar transações' });
    }
});
exports.getTransactions = getTransactions;
const getTransactionSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    try {
        const totals = yield prisma_1.default.transaction.groupBy({
            by: ['type'],
            where: { user_id: userId },
            _sum: {
                amount: true,
            },
        });
        const previsoes = yield prisma_1.default.transaction.count({
            where: {
                user_id: userId,
                expected: true,
            },
        });
        const total_entradas = ((_b = (_a = totals.find(t => t.type === 'entrada')) === null || _a === void 0 ? void 0 : _a._sum.amount) === null || _b === void 0 ? void 0 : _b.toNumber()) || 0;
        const total_saidas = ((_d = (_c = totals.find(t => t.type === 'saida')) === null || _c === void 0 ? void 0 : _c._sum.amount) === null || _d === void 0 ? void 0 : _d.toNumber()) || 0;
        res.status(200).json({
            total_entradas,
            total_saidas,
            saldo: total_entradas - total_saidas,
            previsoes,
        });
    }
    catch (error) {
        console.error('Erro ao gerar resumo:', error);
        res.status(500).json({ error: 'Erro interno ao gerar resumo' });
    }
});
exports.getTransactionSummary = getTransactionSummary;
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const { id } = req.params;
    const userId = Number(req.user.id);
    const { title, amount, type, department, expected, date } = req.body;
    try {
        const updatedTransaction = yield prisma_1.default.transaction.update({
            where: { id: Number(id), user_id: userId },
            data: {
                title,
                amount,
                type,
                department,
                expected,
                date: new Date(date),
            },
        });
        res.status(200).json(updatedTransaction);
    }
    catch (error) {
        console.error('Erro detalhado ao atualizar transação:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário.' });
        }
        res.status(500).json({
            error: 'Erro interno ao atualizar a transação.',
            details: error.message,
            code: error.code
        });
    }
});
exports.updateTransaction = updateTransaction;
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const { id } = req.params;
    const userId = Number(req.user.id);
    try {
        yield prisma_1.default.transaction.delete({
            where: { id: Number(id), user_id: userId },
        });
        res.status(200).json({ message: 'Transação excluída com sucesso' });
    }
    catch (error) {
        res.status(404).json({ error: 'Transação não encontrada' });
    }
});
exports.deleteTransaction = deleteTransaction;
const getTransactionsByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const { department } = req.params;
    const userId = Number(req.user.id);
    try {
        const transactions = yield prisma_1.default.transaction.findMany({
            where: {
                user_id: userId,
                department: { equals: department, mode: 'insensitive' },
            },
            orderBy: { created_at: 'desc' },
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error('Erro ao buscar transações por departamento:', error);
        res.status(500).json({ error: 'Erro interno ao buscar transações' });
    }
});
exports.getTransactionsByDepartment = getTransactionsByDepartment;
const getMonthlySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    try {
        const userId = Number(req.user.id);
        const query = client_1.Prisma.sql `
        SELECT 
          EXTRACT(MONTH FROM date) AS month,
          type,
          SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId} AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY month, type
        ORDER BY month
      `;
        const rows = yield prisma_1.default.$queryRaw(query);
        const result = {};
        for (let i = 1; i <= 12; i++) {
            result[i] = { entrada: 0, saida: 0 };
        }
        rows.forEach((row) => {
            const m = row.month;
            result[m][row.type] = Number(row.total);
        });
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao buscar gráfico mensal:', error);
        res.status(500).json({ error: 'Erro ao gerar gráfico mensal' });
    }
});
exports.getMonthlySummary = getMonthlySummary;
const getByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    try {
        const userId = Number(req.user.id);
        const { month, year } = req.query;
        if (!month || !year) {
            res.status(400).json({ error: 'Informe mês e ano' });
            return;
        }
        const query = client_1.Prisma.sql `
        SELECT department, SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId}
          AND type = 'saida'
          AND EXTRACT(MONTH FROM date) = ${Number(month)}
          AND EXTRACT(YEAR FROM date) = ${Number(year)}
        GROUP BY department
        ORDER BY total DESC
      `;
        const rows = yield prisma_1.default.$queryRaw(query);
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao buscar por departamento:', error);
        res.status(500).json({ error: 'Erro ao gerar gráfico por departamento' });
    }
});
exports.getByDepartment = getByDepartment;
const getMonthlyResume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    try {
        const userId = Number(req.user.id);
        const { month, year } = req.query;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const m = month || currentMonth;
        const y = year || currentYear;
        const query = client_1.Prisma.sql `
        SELECT type, SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId}
          AND EXTRACT(MONTH FROM date) = ${Number(m)}
          AND EXTRACT(YEAR FROM date) = ${Number(y)}
        GROUP BY type
      `;
        const rows = yield prisma_1.default.$queryRaw(query);
        const result = { entrada: 0, saida: 0 };
        rows.forEach((row) => {
            result[row.type] = Number(row.total);
        });
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao gerar resumo mensal:', error);
        res.status(500).json({ error: 'Erro ao gerar resumo do mês' });
    }
});
exports.getMonthlyResume = getMonthlyResume;
const isValidDepartment = (departmentName, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const department = yield prisma_1.default.department.findFirst({
        where: {
            name: departmentName,
            OR: [
                { user_id: userId },
                { is_default: true },
            ],
        },
    });
    return !!department;
});
exports.isValidDepartment = isValidDepartment;
const getSummaryByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    try {
        const query = client_1.Prisma.sql `
        SELECT department, type, SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId}
        GROUP BY department, type
        ORDER BY department
      `;
        const rows = yield prisma_1.default.$queryRaw(query);
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao gerar resumo por departamento:', error);
        res.status(500).json({ error: 'Erro ao gerar resumo por departamento' });
    }
});
exports.getSummaryByDepartment = getSummaryByDepartment;
const getFinancialSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = Number(req.user.id);
    try {
        const query = client_1.Prisma.sql `
        SELECT
          SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) AS total_entrada,
          SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS total_saida
        FROM "Transaction"
        WHERE user_id = ${userId}
      `;
        const rows = yield prisma_1.default.$queryRaw(query);
        const { total_entrada, total_saida } = rows[0];
        const saldo = (Number(total_entrada || 0) - Number(total_saida || 0)).toFixed(2);
        res.json({
            total_entrada: Number(total_entrada || 0),
            total_saida: Number(total_saida || 0),
            saldo: parseFloat(saldo)
        });
    }
    catch (error) {
        console.error('Erro ao obter resumo financeiro:', error);
        res.status(500).json({ error: 'Erro ao obter resumo financeiro' });
    }
});
exports.getFinancialSummary = getFinancialSummary;
