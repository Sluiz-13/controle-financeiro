import pool from '../config/db';
import { Request, Response } from 'express';

const createTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }
  const {title, amount, type, date, department } = req.body;
  const userId = req.user.id;

  console.log("Usuário autenticado:", req.user);
  console.log("Dados recebidos no corpo da requisição:", req.body);

  if (!title || !amount || !type || !date) {
    res.status(400).json({error:"Campos obrigatorios: title, amount, type e date"});
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
      const departmentExists = await isValidDepartment(department, userId);
      if (!departmentExists) {
        // O departamento não existe, então vamos criá-lo
        const createDeptQuery = 'INSERT INTO departments (name, user_id) VALUES ($1, $2)';
        await pool.query(createDeptQuery, [department, userId]);
      }
    }

    const query = `
    INSERT INTO transactions (title, amount, type, date, department, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `;
    
    const values = [title, parsedAmount, type, date, department || null, userId];
    console.log("Valores sendo inseridos no banco de dados:", values);

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar transação", error); 
    res.status(500).json({error:"Erro interno ao criar transação"});
  }
};




const getTransactions = async (req: Request, res: Response) => {
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
      params.push(month as string);
      paramIndex++;
    }

    if (year) {
      query += ` AND EXTRACT(YEAR FROM date) = ${paramIndex}`;
      params.push(year as string);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = ${paramIndex}`;
      params.push(type as string);
      paramIndex++;
    }

    if (department) {
      query += ` AND department = ${paramIndex}`;
      params.push(department as string);
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);

  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno ao buscar transações' });
  }
}





const getTransactionSummary = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
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

const updateTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
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

const deleteTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
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

const getTransactionsByDepartment = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
    return;
  }
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

interface MonthlySummaryResult {
  [key: number]: { entrada: number; saida: number };
}

const getMonthlySummary = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
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
    const result: MonthlySummaryResult = {}

    for (let i = 1; i <= 12; i++) {
      result[i] = { entrada: 0, saida: 0 }
    }

    rows.forEach((row: { month: number; type: 'entrada' | 'saida'; total: string }) => {
      const m = row.month;
      result[m][row.type] = parseFloat(row.total);
    })

    res.json(result)

  } catch (error) {
    console.error('Erro ao buscar gráfico mensal:', error)
    res.status(500).json({ error: 'Erro ao gerar gráfico mensal' })
  }
}

const getByDepartment = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  try {
    const userId = req.user.id
    const { month, year } = req.query

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
    `

    const { rows } = await pool.query(query, [userId, month as string, year as string])
    res.json(rows)

  } catch (error) {
    console.error('Erro ao buscar por departamento:', error)
    res.status(500).json({ error: 'Erro ao gerar gráfico por departamento' })
  }
}

interface MonthlyResumeResult {
  entrada: number;
  saida: number;
}

const getMonthlyResume = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  try {
    const userId = req.user.id
    const { month, year } = req.query

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const m = (month as string) || currentMonth
    const y = (year as string) || currentYear

    const query = `
      SELECT type, SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
      GROUP BY type
    `

    const { rows } = await pool.query(query, [userId, m, y])

    const result: MonthlyResumeResult = { entrada: 0, saida: 0 }

    rows.forEach((row: { type: 'entrada' | 'saida'; total: string }) => {
      result[row.type] = parseFloat(row.total)
    })

    res.json(result)

  } catch (error) {
    console.error('Erro ao gerar resumo mensal:', error)
    res.status(500).json({ error: 'Erro ao gerar resumo do mês' })
  }
}

const isValidDepartment = async (departmentName: string, userId: string) => {
  const query = `
    SELECT 1 FROM departments
    WHERE name = $1 AND (user_id = $2 OR is_default = true)
    LIMIT 1
  `
  const { rows } = await pool.query(query, [departmentName, userId])
  return rows.length > 0
}

const getSummaryByDepartment = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
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

const getFinancialSummary = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
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


export {
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



