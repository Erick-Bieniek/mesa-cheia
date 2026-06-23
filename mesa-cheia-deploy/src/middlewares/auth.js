const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'mesa-cheia-segredo';

// ---------------------------------------------------------------------------
// BASIC AUTH  (exigido no enunciado para POST /products e DELETE /product/:id)
// O cliente envia o header:  Authorization: Basic base64(email:senha)
// Validamos contra a tabela users e EXIGIMOS isAdmin=1.
// ---------------------------------------------------------------------------
function basicAuth(req, _res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Basic ')) {
    return next(new AppError(401, 'Credenciais ausentes. Use Basic Auth (email:senha).'));
  }

  // "Basic xxxx" -> decodifica base64 -> "email:senha"
  const base64 = header.split(' ')[1];
  const [email, senha] = Buffer.from(base64, 'base64').toString('utf-8').split(':');

  const user = userModel.findByEmail(email);
  if (!user || !bcrypt.compareSync(senha || '', user.password)) {
    return next(new AppError(401, 'Email ou senha invalidos.'));
  }
  if (!user.isAdmin) {
    return next(new AppError(401, 'Acesso restrito a administradores.'));
  }

  req.user = { id: user.id, email: user.email, isAdmin: true };
  next();
}

// ---------------------------------------------------------------------------
// JWT AUTH  (rotas bonus: carrinho persistido por usuario)
// O cliente envia:  Authorization: Bearer <token>
// ---------------------------------------------------------------------------
function jwtAuth(req, _res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token ausente. Faca login para obter um token.'));
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, isAdmin: !!payload.isAdmin };
    next();
  } catch (_err) {
    next(new AppError(401, 'Token invalido ou expirado.'));
  }
}

module.exports = { basicAuth, jwtAuth, JWT_SECRET };
