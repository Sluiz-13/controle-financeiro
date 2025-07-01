import api from '../assets/api';

// Função para buscar o token do localStorage
const getToken = () => localStorage.getItem('token');

// Configuração do cabeçalho com o token
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

/**
 * Busca todas as transações.
 */
export const getTransactions = () => {
  return api.get('/api/transactions', getAuthHeaders());
};

/**
 * Deleta uma transação pelo ID.
 * @param {string} id - O ID da transação a ser deletada.
 */
export const deleteTransaction = (id) => {
  return api.delete(`/api/transactions/${id}`, getAuthHeaders());
};

/**
 * Cria uma nova transação.
 * @param {object} transactionData - Os dados da nova transação.
 */
export const createTransaction = (transactionData) => {
  return api.post('/api/transactions', transactionData, getAuthHeaders());
};

/**
 * Atualiza uma transação existente.
 * @param {string} id - O ID da transação a ser atualizada.
 * @param {object} transactionData - Os novos dados da transação.
 */
export const updateTransaction = (id, transactionData) => {
  return api.put(`/api/transactions/${id}`, transactionData, getAuthHeaders());
};
