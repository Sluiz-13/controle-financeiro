"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const helmet_1 = __importDefault(require("helmet"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '686328e6e87814544a69451a--controlefinanceiroweb.netlify.app', // Permite todas as origens (para depuração, restrinja depois!)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permite todos os métodos comuns
    allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos comuns
    credentials: true // Permite o envio de cookies e cabeçalhos de autorização
}));
const PORT = process.env.PORT || 5000;
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
const transactionsRoutes_1 = __importDefault(require("./routes/transactionsRoutes"));
const departmentsRoutes_1 = __importDefault(require("./routes/departmentsRoutes"));
app.use('/api', transactionsRoutes_1.default);
app.use('/api', protectedRoutes_1.default);
app.use('/api', departmentsRoutes_1.default);
// Rotas
app.use('/api/auth', authRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
