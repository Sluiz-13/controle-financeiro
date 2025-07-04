import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import pool from './config/db';

dotenv.config();

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
    origin: true, // Aceita qualquer origem
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
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao conectar ao PostgreSQL ou iniciar o servidor:', err);
    process.exit(1); // Encerra o processo se não conseguir conectar ao DB
  }
}

startServer();