// Pequeno wrapper que captura erros de funcoes async dos controllers e
// encaminha pro next() (middleware de erro), evitando try/catch repetido.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
