"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const transactionsController = __importStar(require("../controllers/transactionsController"));
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// Criar transação
// Criar transação
router.post('/transactions', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.createTransaction));
// Listar transações do usuário
router.get('/transactions', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getTransactions));
// Resumo financeiro do usuário
router.get('/transactions/summary', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getTransactionSummary));
// Atualizar transação
router.put('/transactions/:id', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.updateTransaction));
// Excluir transação
router.delete('/transactions/:id', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.deleteTransaction));
// Mostrar transação por departamento
router.get('/transactions/department/:department', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getTransactionsByDepartment));
//Mostrar os graficos 
router.get('/transactions/graph/monthly', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getMonthlySummary));
// Mostrar por departamento
router.get('/transactions/graph/department', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getByDepartment));
router.get('/transactions/graph/resumo', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getMonthlyResume));
router.get('/transactions/summary-by-department', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getSummaryByDepartment));
router.get('/transactions/financial-summary', verifyToken_1.default, (0, asyncHandler_1.default)(transactionsController.getFinancialSummary));
exports.default = router;
