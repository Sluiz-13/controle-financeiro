import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import pool from './config/db';

dotenv.config();

import authRoutes from './routers/authRoutes';
import protectedRoutes from './routers/protectedRouters';
import transactionsRoutes from './routers/transactionsRoutes';
import departmentsRoutes from './routers/departmentsRoutes';

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'https://controlefinanceiroweb.netlify.app',
  'https://controle-financeiro-arf4.onrender.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.connect();
    console.log('Conectado ao PostgreSQL com sucesso!');

    // Rotas da API
    app.use('/api/auth', authRoutes);
    app.use('/api', transactionsRoutes);
    app.use('/api', protectedRoutes); 
    app.use('/api', departmentsRoutes);

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao conectar ao PostgreSQL ou iniciar o servidor:', err);
    process.exit(1); // Encerra o processo se não conseguir conectar ao DB
  }
}

startServer();