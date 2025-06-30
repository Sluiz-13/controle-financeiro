import express from 'express';
const router = express.Router();
import * as transactionsController from '../controllers/transactionsController';

import verifyToken from '../middleware/verifyToken';
import asyncHandler from '../utils/asyncHandler';

// Criar transação
// Criar transação
router.post('/transactions', verifyToken, asyncHandler(transactionsController.createTransaction));

// Listar transações do usuário
router.get('/transactions', verifyToken, asyncHandler(transactionsController.getTransactions));

// Resumo financeiro do usuário
router.get('/transactions/summary', verifyToken, asyncHandler(transactionsController.getTransactionSummary));

// Atualizar transação
router.put('/transactions/:id', verifyToken, asyncHandler(transactionsController.updateTransaction));

// Excluir transação
router.delete('/transactions/:id', verifyToken, asyncHandler(transactionsController.deleteTransaction));

// Mostrar transação por departamento
router.get('/transactions/department/:department', verifyToken, asyncHandler(transactionsController.getTransactionsByDepartment));

//Mostrar os graficos 
router.get('/transactions/graph/monthly', verifyToken, asyncHandler(transactionsController.getMonthlySummary))

// Mostrar por departamento
router.get('/transactions/graph/department', verifyToken, asyncHandler(transactionsController.getByDepartment))

router.get('/transactions/graph/resumo', verifyToken, asyncHandler(transactionsController.getMonthlyResume))

router.get('/transactions/summary-by-department', verifyToken, asyncHandler(transactionsController.getSummaryByDepartment))

router.get('/transactions/financial-summary', verifyToken, asyncHandler(transactionsController.getFinancialSummary))


export default router;