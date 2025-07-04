import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import pool from './config/db';

dotenv.config();

<<<<<<< HEAD
=======


import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import departmentsRoutes from './routes/departmentsRoutes';

>>>>>>> 3c9f5def760debff2ab3c5d63e55ef2ab3d6e07e
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

<<<<<<< HEAD
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
=======

console.log("rotas")
app.use('/api/auth', authRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes); 
app.use('/api', departmentsRoutes);
>>>>>>> 3c9f5def760debff2ab3c5d63e55ef2ab3d6e07e

startServer();