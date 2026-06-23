// Middleware CENTRAL de erros. Todo erro lancado/encaminhado na app cai aqui e
// vira uma resposta JSON padronizada. Express identifica como handler de erro
// porque a funcao tem 4 parametros (err, req, res, next).
module.exports = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // Em 500 (erro inesperado), logamos o stack pra depurar — mas NAO vazamos
  // detalhes internos pro cliente.
  if (statusCode === 500) {
    console.error('[ERRO 500]', err);
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message: statusCode === 500
        ? 'Erro interno do servidor.'
        : err.message,
    },
  });
};
