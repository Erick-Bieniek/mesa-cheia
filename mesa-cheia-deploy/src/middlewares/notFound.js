const AppError = require('../utils/AppError');

// Se nenhuma rota acima respondeu, caiu aqui: rota inexistente -> 404.
module.exports = (req, _res, next) => {
  next(new AppError(404, `Rota nao encontrada: ${req.method} ${req.originalUrl}`));
};
