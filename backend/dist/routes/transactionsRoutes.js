"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const transactionsController_1 = require("../controllers/transactionsController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// Criar transação
router.post('/transactions', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.createTransaction));
// Listar transações do usuário
router.get('/transactions', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getTransactions));
// Resumo financeiro do usuário
router.get('/transactions/summary', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getTransactionSummary));
// Atualizar transação
router.put('/transactions/:id', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.updateTransaction));
// Excluir transação
router.delete('/transactions/:id', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.deleteTransaction));
// Mostrar transação por departamento
router.get('/transactions/department/:department', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getTransactionsByDepartment));
//Mostrar os graficos 
router.get('/transactions/graph/monthly', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getMonthlySummary));
// Mostrar por departamento
router.get('/transactions/graph/department', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getByDepartment));
router.get('/transactions/graph/resumo', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getMonthlyResume));
router.get('/transactions/summary-by-department', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getSummaryByDepartment));
router.get('/transactions/financial-summary', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController_1.getFinancialSummary));
exports.default = router;
