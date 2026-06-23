// GET /health — confirma que o servico esta de pe (usado em monitoramento).
exports.health = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mesa-cheia-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
