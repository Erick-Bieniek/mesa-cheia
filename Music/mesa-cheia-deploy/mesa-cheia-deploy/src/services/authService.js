const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { JWT_SECRET } = require('../middlewares/auth');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// remove a senha (hash) antes de devolver o usuario pro cliente
function safe(user) {
  const { password, ...rest } = user;
  return rest;
}

function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError(400, 'Informe name, email e password.');
  }
  if (!emailRegex.test(email)) throw new AppError(400, 'Email invalido.');
  if (password.length < 6) throw new AppError(400, 'A senha deve ter ao menos 6 caracteres.');
  if (userModel.findByEmail(email)) throw new AppError(409, 'Email ja cadastrado.');

  const passwordHash = bcrypt.hashSync(password, 10); // senha criptografada
  const user = userModel.create({ name, email, passwordHash, isAdmin: 0 });
  return safe(user);
}

function login({ email, password }) {
  if (!email || !password) throw new AppError(400, 'Informe email e password.');

  const user = userModel.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new AppError(401, 'Email ou senha invalidos.');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin: !!user.isAdmin },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token, user: safe(user) };
}

module.exports = { register, login };
