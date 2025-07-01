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

// 👉 CORS deve vir antes de tudo que use rotas
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

app.options('*', cors()); // 👈 permite preflight OPTIONS

import protectedRoutes from './routes/protectedRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import departmentsRoutes from './routes/departmentsRoutes';


app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes); 
app.use('/api', departmentsRoutes)


// Rotas
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



