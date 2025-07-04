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
const db_1 = __importDefault(require("../config/db"));
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    const { title, amount, type, date, department } = req.body;
    const userId = req.user.id;
    console.log("Usuário autenticado:", req.user);
    console.log("Dados recebidos no corpo da requisição:", req.body);
    if (!title || !amount || !type || !date) {
        res.status(400).json({ error: "Campos obrigatorios: title, amount, type e date" });
        return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
        res.status(400).json({ error: "O valor da transação (amount) deve ser um número válido." });
        return;
    }
    try {
        // Se um departamento foi informado, verifica se ele existe. Se não, cria um novo.
        if (department) {
            const departmentExists = yield isValidDepartment(department, userId);
            if (!departmentExists) {
                // O departamento não existe, então vamos criá-lo
                const createDeptQuery = 'INSERT INTO departments (name, user_id) VALUES ($1, $2)';
                yield db_1.default.query(createDeptQuery, [department, userId]);
            }
        }
        const query = `
      INSERT INTO transactions (title, amount, type, date, department)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        console.log("Query SQL que será executada:", query); // Adicione esta linha
        const values = [title, parsedAmount, type, date, department || null];
        console.log("Valores que serão passados para a query:", values); // Adicione esta linha
        const result = yield db_1.default.query(query, values);
        res.status(201).json(result.rows[0]);
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
    const userId = req.user.id;
    try {
        // Pegando filtros opcionais
        const { month, year, type, department } = req.query;
        let query = `SELECT * FROM transactions WHERE user_id = $1`;
        let params = [userId];
        let paramIndex = 2;
        if (month) {
            query += ` AND EXTRACT(MONTH FROM date) = ${paramIndex}`;
            params.push(month);
            paramIndex++;
        }
        if (year) {
            query += ` AND EXTRACT(YEAR FROM date) = ${paramIndex}`;
            params.push(year);
            paramIndex++;
        }
        if (type) {
            query += ` AND type = ${paramIndex}`;
            params.push(type);
            paramIndex++;
        }
        if (department) {
            query += ` AND department = ${paramIndex}`;
            params.push(department);
        }
        const { rows } = yield db_1.default.query(query, params);
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro interno ao buscar transações' });
    }
});
exports.getTransactions = getTransactions;
const getTransactionSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = req.user.id;
    try {
        const result = yield db_1.default.query(`
      SELECT
        SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS total_saidas,
        SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) -
        SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS saldo,
        COUNT(*) FILTER (WHERE expected = true) AS previsoes
      FROM transactions
      WHERE user_id = $1
      `, [userId]);
        res.status(200).json(result.rows[0]);
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
    const userId = req.user.id;
    const { title, amount, type, department, expected } = req.body;
    try {
        const result = yield db_1.default.query(`UPDATE transactions
       SET title = $1, amount = $2, type = $3, department = $4, expected = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`, [title, amount, type, department, expected, id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar' });
    }
});
exports.updateTransaction = updateTransaction;
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = yield db_1.default.query(`DELETE FROM transactions WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }
        res.status(200).json({ message: 'Transação excluída com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir transação:', error);
        res.status(500).json({ error: 'Erro interno ao excluir' });
    }
});
exports.deleteTransaction = deleteTransaction;
const getTransactionsByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
        return;
    }
    const { department } = req.params;
    const userId = req.user.id;
    try {
        const result = yield db_1.default.query(`SELECT * FROM transactions
       WHERE user_id = $1 AND department ILIKE $2
       ORDER BY created_at DESC`, [userId, department]);
        res.status(200).json(result.rows);
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
        const userId = req.user.id;
        const query = `
      SELECT 
        EXTRACT(MONTH FROM date) AS month,
        type,
        SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month, type
      ORDER BY month
    `;
        const { rows } = yield db_1.default.query(query, [userId]);
        // Organizar em formato mais fácil para o front
        const result = {};
        for (let i = 1; i <= 12; i++) {
            result[i] = { entrada: 0, saida: 0 };
        }
        rows.forEach((row) => {
            const m = row.month;
            result[m][row.type] = parseFloat(row.total);
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
        const userId = req.user.id;
        const { month, year } = req.query;
        if (!month || !year) {
            res.status(400).json({ error: 'Informe mês e ano' });
            return;
        }
        const query = `
      SELECT department, SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1
        AND type = 'saida'
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
      GROUP BY department
      ORDER BY total DESC
    `;
        const { rows } = yield db_1.default.query(query, [userId, month, year]);
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
        const userId = req.user.id;
        const { month, year } = req.query;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const m = month || currentMonth;
        const y = year || currentYear;
        const query = `
      SELECT type, SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
      GROUP BY type
    `;
        const { rows } = yield db_1.default.query(query, [userId, m, y]);
        const result = { entrada: 0, saida: 0 };
        rows.forEach((row) => {
            result[row.type] = parseFloat(row.total);
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
    const query = `
    SELECT 1 FROM departments
    WHERE name = $1 AND (user_id = $2 OR is_default = true)
    LIMIT 1
  `;
    const { rows } = yield db_1.default.query(query, [departmentName, userId]);
    return rows.length > 0;
});
exports.isValidDepartment = isValidDepartment;
const getSummaryByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = req.user.id;
    try {
        const query = `
      SELECT department, type, SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1
      GROUP BY department, type
      ORDER BY department
    `;
        const { rows } = yield db_1.default.query(query, [userId]);
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
    const userId = req.user.id;
    try {
        const query = `
      SELECT
        SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) AS total_entrada,
        SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS total_saida
      FROM transactions
      WHERE user_id = $1
    `;
        const { rows } = yield db_1.default.query(query, [userId]);
        const { total_entrada, total_saida } = rows[0];
        const saldo = (parseFloat(total_entrada || 0) - parseFloat(total_saida || 0)).toFixed(2);
        res.json({
            total_entrada: parseFloat(total_entrada || 0),
            total_saida: parseFloat(total_saida || 0),
            saldo: parseFloat(saldo)
        });
    }
    catch (error) {
        console.error('Erro ao obter resumo financeiro:', error);
        res.status(500).json({ error: 'Erro ao obter resumo financeiro' });
    }
});
exports.getFinancialSummary = getFinancialSummary;
