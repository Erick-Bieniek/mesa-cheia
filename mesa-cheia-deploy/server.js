require('dotenv').config();

const app = require('./src/app');
const { initDb } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Cria as tabelas (se nao existirem) e popula os dados iniciais ANTES de subir o servidor.
// Assim o professor so precisa: npm install -> npm start, e ja tem dados pra testar.
initDb();

app.listen(PORT, () => {
  console.log(`Mesa Cheia API rodando em http://localhost:${PORT}`);
  console.log(`Swagger (documentacao) em http://localhost:${PORT}/docs`);
  console.log(`Health check em        http://localhost:${PORT}/health`);
});
