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




const PORT = process.env.PORT || 5000;

// Rotas da API
console.log("rotas")
app.use('/api/auth', authRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes); 
app.use('/api', departmentsRoutes);

// Rota de fallback para 404 — compatível com Express 5
app.all('/*', (req, res) => {
  res.status(404).json({ message: `Rota não encontrada: ${req.originalUrl}` });
});


// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
