import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import departmentsRoutes from './routes/departmentsRoutes';

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
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ✅ Corrigido: substituindo '*' por '/*' para compatibilidade com Express 5
app.options('/*', cors());

const PORT = process.env.PORT || 5000;

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes); 
app.use('/api', departmentsRoutes);

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
