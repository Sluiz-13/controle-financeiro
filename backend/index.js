const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
const protectedRoutes = require('./routes/protectedRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const departmentsRoutes = require('./routes/departmentsRoutes')

app.use('/api', transactionsRoutes);
app.use('/api', protectedRoutes); 
app.use('/api', departmentsRoutes)
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



