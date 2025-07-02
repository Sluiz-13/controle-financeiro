import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


import { Request, Response } from 'express';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // Verifica se o email já existe
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Email já registrado' });
      return;
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere no banco de dados
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

        const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido');
    }
    const token = jwt.sign({ id: newUser.rows[0].id }, jwtSecret, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    console.log('Attempting login for email:', email);
    console.log('Password received:', password);
    console.log('Hashed password from DB:', user.password);

    // Verifica a senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', passwordMatch);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Senha incorreta' });
    }

    // Gera o token JWT
        const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido');
    }
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
