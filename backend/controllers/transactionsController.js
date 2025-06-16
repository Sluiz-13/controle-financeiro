const pool = require('../config/db');

const createTransaction = async (req, res) => {
  const {title, amount, type, date, department } = req.body;
  const userId = req.user.id;

  if (!title || !amount || !type || !date) {
    return res.status(400).json({error:"Campos obrigatorios: title, amount, type e date"});
  }
  try{
    const query = `
    INSERT INTO transactions (title, amount, type, date, department, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING*;
    `;
    
    const values = [title, amount, type, date, department || null, userId];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar transação", error); 
    res.status(500).json({error:"Erro interno ao criar transação"});
  }
};


module.exports = {
  createTransaction
};

const getTransactions = async (req, res) => {
    const { title, amount, type, date, department } = req.body
    const userId = req.user.id

    // Validação básica
    if (!title || !amount || !type || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios: title, amount, type e date' })
    }

    // Nova validação de departamento
    const isValid = await isValidDepartment(department, userId)
    if (!isValid) {
      return res.status(400).json({ error: 'Departamento inválido' })
    }

  try {
    const userId = req.user.id
    const { month, year, type, department } = req.query

    let query = `SELECT * FROM transactions WHERE user_id = $1`
    let params = [userId]
    let paramIndex = 2

    if (month) {
      query += ` AND EXTRACT(MONTH FROM date) = $${paramIndex}`
      params.push(month)
      paramIndex++
    }

    if (year) {
      query += ` AND EXTRACT(YEAR FROM date) = $${paramIndex}`
      params.push(year)
      paramIndex++
    }

    if (type) {
      query += ` AND type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    if (department) {
      query += ` AND department = $${paramIndex}`
      params.push(department)
    }

    const { rows } = await pool.query(query, params)
    res.json(rows)

  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    res.status(500).json({ error: 'Erro interno ao buscar transações' })
  }
}


module.exports = {
  createTransaction,
  getTransactions
};

const getTransactionSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT
        SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS total_saidas,
        SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) -
        SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS saldo,
        COUNT(*) FILTER (WHERE expected = true) AS previsoes
      FROM transactions
      WHERE user_id = $1
      `,
      [userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    res.status(500).json({ error: 'Erro interno ao gerar resumo' });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, amount, type, department, expected } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET title = $1, amount = $2, type = $3, department = $4, expected = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, amount, type, department, expected, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar' });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.status(200).json({ message: 'Transação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({ error: 'Erro interno ao excluir' });
  }
};

const getTransactionsByDepartment = async (req, res) => {
  const { department } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM transactions
       WHERE user_id = $1 AND department ILIKE $2
       ORDER BY created_at DESC`,
      [userId, department]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar transações por departamento:', error);
    res.status(500).json({ error: 'Erro interno ao buscar transações' });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id

    const query = `
      SELECT 
        EXTRACT(MONTH FROM date) AS month,
        type,
        SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month, type
      ORDER BY month
    `
    const { rows } = await pool.query(query, [userId])

    // Organizar em formato mais fácil para o front
    const result = {}

    for (let i = 1; i <= 12; i++) {
      result[i] = { entrada: 0, saida: 0 }
    }

    rows.forEach(row => {
      const m = row.month
      result[m][row.type] = parseFloat(row.total)
    })

    res.json(result)

  } catch (error) {
    console.error('Erro ao buscar gráfico mensal:', error)
    res.status(500).json({ error: 'Erro ao gerar gráfico mensal' })
  }
}

const getByDepartment = async (req, res) => {
  try {
    const userId = req.user.id
    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({ error: 'Informe mês e ano' })
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
    `

    const { rows } = await pool.query(query, [userId, month, year])
    res.json(rows)

  } catch (error) {
    console.error('Erro ao buscar por departamento:', error)
    res.status(500).json({ error: 'Erro ao gerar gráfico por departamento' })
  }
}

const getMonthlyResume = async (req, res) => {
  try {
    const userId = req.user.id
    const { month, year } = req.query

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const m = month || currentMonth
    const y = year || currentYear

    const query = `
      SELECT type, SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
      GROUP BY type
    `

    const { rows } = await pool.query(query, [userId, m, y])

    const result = { entrada: 0, saida: 0 }

    rows.forEach(row => {
      result[row.type] = parseFloat(row.total)
    })

    res.json(result)

  } catch (error) {
    console.error('Erro ao gerar resumo mensal:', error)
    res.status(500).json({ error: 'Erro ao gerar resumo do mês' })
  }
}

const isValidDepartment = async (departmentName, userId) => {
  const query = `
    SELECT 1 FROM departments
    WHERE name = $1 AND (user_id = $2 OR is_default = true)
    LIMIT 1
  `
  const { rows } = await pool.query(query, [departmentName, userId])
  return rows.length > 0
}

const getSummaryByDepartment = async (req, res) => {
  const userId = req.user.id

  try {
    const query = `
      SELECT department, type, SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1
      GROUP BY department, type
      ORDER BY department
    `
    const { rows } = await pool.query(query, [userId])
    res.json(rows)
  } catch (error) {
    console.error('Erro ao gerar resumo por departamento:', error)
    res.status(500).json({ error: 'Erro ao gerar resumo por departamento' })
  }
}

const getFinancialSummary = async (req, res) => {
  const userId = req.user.id

  try {
    const query = `
      SELECT
        SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) AS total_entrada,
        SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS total_saida
      FROM transactions
      WHERE user_id = $1
    `
    const { rows } = await pool.query(query, [userId])
    const { total_entrada, total_saida } = rows[0]

    const saldo = (parseFloat(total_entrada || 0) - parseFloat(total_saida || 0)).toFixed(2)

    res.json({
      total_entrada: parseFloat(total_entrada || 0),
      total_saida: parseFloat(total_saida || 0),
      saldo: parseFloat(saldo)
    })
  } catch (error) {
    console.error('Erro ao obter resumo financeiro:', error)
    res.status(500).json({ error: 'Erro ao obter resumo financeiro' })
  }
}


module.exports = {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDepartment,
  getMonthlySummary,
  getByDepartment,
  getMonthlyResume,
  isValidDepartment,
  getSummaryByDepartment,
  getFinancialSummary
};



