const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Acesso autorizado',
    userId: req.user.id, // veio do token
  });
});

module.exports = router;
