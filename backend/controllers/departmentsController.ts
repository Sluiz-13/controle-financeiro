import pool from '../config/db';

import { Request, Response } from 'express';

// Listar departamentos do usuário
const getDepartments = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = req.user.id
  try {
    const query = `SELECT * FROM departments WHERE user_id = $1 AND is_active = TRUE ORDER BY name`
    const { rows } = await pool.query(query, [userId])
    res.json(rows)
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error)
    res.status(500).json({ error: 'Erro ao buscar departamentos' })
  }
}

// Criar novo departamento
const createDepartment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = req.user.id
  const { name } = req.body
  try {
    const query = `INSERT INTO departments (name, user_id) VALUES ($1, $2) RETURNING *`
    const { rows } = await pool.query(query, [name, userId])
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Erro ao criar departamento:', error)
    res.status(500).json({ error: 'Erro ao criar departamento' })
  }
}

export { getDepartments, createDepartment };
