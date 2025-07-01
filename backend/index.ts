import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import helmet from 'helmet';

import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json());
app.use(helmet());

const PORT = process.env.PORT || 5000;

import protectedRoutes from './routes/protectedRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import departmentsRoutes from './routes/departmentsRoutes';

app.use(cors({
  origin: '*', // Permite todas as origens (para depuração, restrinja depois!)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permite todos os métodos comuns
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos comuns
  credentials: true // Permite o envio de cookies e cabeçalhos de autorização
}));
app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes); 
app.use('/api', departmentsRoutes)


// Rotas
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



