const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se existe um token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // salva o id do usuário para uso nas próximas rotas
    next(); // segue para o próximo passo (ex: controller)
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = verifyToken;
