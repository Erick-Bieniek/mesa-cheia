const AppError = require('../utils/AppError');

// Valida e normaliza os parametros de /search: page e limit precisam ser
// numeros inteiros >= 0/>=1 (regra do enunciado). Joga req.query ja sanitizado.
module.exports = (req, _res, next) => {
  let { page = '1', limit = '12' } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (!Number.isInteger(page) || page < 1) {
    return next(new AppError(400, 'Parametro "page" deve ser um inteiro >= 1.'));
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next(new AppError(400, 'Parametro "limit" deve ser um inteiro entre 1 e 100.'));
  }

  req.pagination = { page, limit };
  next();
};
