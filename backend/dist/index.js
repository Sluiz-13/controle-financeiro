"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
dotenv_1.default.config();
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
const transactionsRoutes_1 = __importDefault(require("./routes/transactionsRoutes"));
const departmentsRoutes_1 = __importDefault(require("./routes/departmentsRoutes"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
const allowedOrigins = [
    'http://localhost:5173',
    'https://controlefinanceiroweb.netlify.app',
    'https://controle-financeiro-arf4.onrender.com'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const PORT = process.env.PORT || 5000;
// Rotas da API
console.log("rotas");
app.use('/api/auth', authRoutes_1.default);
app.use('/api', transactionsRoutes_1.default);
app.use('/api', protectedRoutes_1.default);
app.use('/api', departmentsRoutes_1.default);
// Rota de fallback para 404 — compatível com Express 5
app.all('/*', (req, res) => {
    res.status(404).json({ message: `Rota não encontrada: ${req.originalUrl}` });
});
// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
