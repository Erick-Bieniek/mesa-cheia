const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

// POST /register -> cria cliente (201). Senha sai criptografada no banco.
exports.register = asyncHandler(async (req, res) => {
  const user = authService.register(req.body || {});
  res.status(201).json(user);
});

// POST /login -> devolve token JWT (200)
exports.login = asyncHandler(async (req, res) => {
  const result = authService.login(req.body || {});
  res.status(200).json(result);
});
