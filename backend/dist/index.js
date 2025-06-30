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
const PORT = process.env.PORT || 5000;
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
const transactionsRoutes_1 = __importDefault(require("./routes/transactionsRoutes"));
const departmentsRoutes_1 = __importDefault(require("./routes/departmentsRoutes"));
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173'
}));
app.use('/api', transactionsRoutes_1.default);
app.use('/api', protectedRoutes_1.default);
app.use('/api', departmentsRoutes_1.default);
// Rotas
app.use('/api/auth', authRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
