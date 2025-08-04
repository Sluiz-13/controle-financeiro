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
const authRoutes_1 = __importDefault(require("./routers/authRoutes"));
const protectedRouters_1 = __importDefault(require("./routers/protectedRouters"));
const transactionsRoutes_1 = __importDefault(require("./routers/transactionsRoutes"));
const departmentsRoutes_1 = __importDefault(require("./routers/departmentsRoutes"));
const savingsRoutes_1 = __importDefault(require("./routers/savingsRoutes"));
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
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api', transactionsRoutes_1.default);
app.use('/api', protectedRouters_1.default);
app.use('/api', departmentsRoutes_1.default);
app.use('/api/savings', savingsRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
