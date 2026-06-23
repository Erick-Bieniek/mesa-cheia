// Erro "de aplicacao" com codigo HTTP embutido. Em vez de espalhar
// res.status(404) pelos controllers, a gente lanca: throw new AppError(404, 'msg').
// O middleware central de erro le esse statusCode e responde padronizado.
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // erro previsto (validacao, nao-encontrado...), nao bug
  }
}

module.exports = AppError;
