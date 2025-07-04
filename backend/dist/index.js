"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
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
    origin: true, // Aceita qualquer origem
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const PORT = process.env.PORT || 5000;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.default.connect();
            console.log('Conectado ao PostgreSQL com sucesso!');
            app.listen(PORT, () => {
                console.log(`Servidor rodando na porta ${PORT}`);
            });
        }
        catch (err) {
            console.error('Erro ao conectar ao PostgreSQL ou iniciar o servidor:', err);
            process.exit(1); // Encerra o processo se não conseguir conectar ao DB
        }
    });
}
startServer();
