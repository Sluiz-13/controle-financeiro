// index.ts
import express from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🌐 Origens permitidas (dev + produção + pré-visualizações Netlify)
const allowedOrigins = [
  "http://localhost:5173",
  "https://controlefinanceiroweb.netlify.app",
  "https://6863c9381ef2de000834a847--controlefinanceiroweb.netlify.app",
  "https://6863c93---controlefinanceiroweb.netlify.app"
];

// 🔐 Configuração CORS com tipos explícitos para TypeScript
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 🧱 Middlewares principais
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(helmet());

// 📦 Rotas importadas
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import departmentsRoutes from './routes/departmentsRoutes';

app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes);
app.use('/api', departmentsRoutes);
app.use('/api/auth', authRoutes);

// 🚀 Inicializa servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
