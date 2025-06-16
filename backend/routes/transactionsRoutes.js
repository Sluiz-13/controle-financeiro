const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDepartment,
  getMonthlySummary, 
  getByDepartment,
  getMonthlyResume, 
  getSummaryByDepartment,
  getFinancialSummary
} = require('../controllers/transactionsController');

const verifyToken = require('../middleware/verifyToken');

// Criar transação
router.post('/transactions', verifyToken, createTransaction);

// Listar transações do usuário
router.get('/transactions', verifyToken, getTransactions);

// Resumo financeiro do usuário
router.get('/transactions/summary', verifyToken, getTransactionSummary);

// Atualizar transação
router.put('/transactions/:id', verifyToken, updateTransaction);

// Excluir transação
router.delete('/transactions/:id', verifyToken, deleteTransaction);

// Mostrar transação por departamento
router.get('/transactions/department/:department', verifyToken, getTransactionsByDepartment);

//Mostrar os graficos 
router.get('/transactions/graph/monthly', verifyToken, getMonthlySummary)

// Mostrar por departamento
router.get('/transactions/graph/department', verifyToken, getByDepartment)

router.get('/transactions/graph/resumo', verifyToken, getMonthlyResume)

router.get('/transactions/summary-by-department', verifyToken, getSummaryByDepartment)

router.get('/transactions/financial-summary', verifyToken, getFinancialSummary)


module.exports = router;