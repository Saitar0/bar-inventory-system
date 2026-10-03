const rateLimit = require('express-rate-limit');

// Limite geral para as rotas da API, evitando abuso e ataques de força bruta.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' },
});

// Limite mais restritivo para as rotas de autenticação (login/registro).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de autenticação. Tente novamente mais tarde.' },
});

module.exports = { apiLimiter, authLimiter };
