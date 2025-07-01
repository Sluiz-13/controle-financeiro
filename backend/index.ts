import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Lista de origens permitidas (dev + prod + builds temporários do Netlify)
const allowedOrigins = [
  "http://localhost:5173",
  "https://controlefinanceiroweb.netlify.app",
  "https://6863c9381ef2de000834a847--controlefinanceiroweb.netlify.app",
  "https://6863c93---controlefinanceiroweb.netlify.app"
];

// 🎯 Função para verificar origem permitida
const corsOptions = {
  origin: (origin, callback) => {
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

// 🧱 Middlewares
app.use(cors(corsOptions)); // aplica CORS personalizado
app.options("*", cors(corsOptions)); // aplica CORS também no preflight OPTIONS
app.use(express.json());
app.use(helmet());

// 🚀 Suas rotas
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import departmentsRoutes from './routes/departmentsRoutes.js';

app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes);
app.use('/api', departmentsRoutes);
app.use('/api/auth', authRoutes);

// 🟢 Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
