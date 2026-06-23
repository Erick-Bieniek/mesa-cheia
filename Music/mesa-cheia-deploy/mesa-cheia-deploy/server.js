require('dotenv').config();

const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const { initDb } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Apaga o banco velho para recriar com dados atualizados
const dbPath = path.join(__dirname, 'database.sqlite');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Banco antigo removido — recriando...');
}

initDb();

app.listen(PORT, () => {
  console.log(`Mesa Cheia API rodando em http://localhost:${PORT}`);
  console.log(`Swagger (documentacao) em http://localhost:${PORT}/docs`);
  console.log(`Health check em        http://localhost:${PORT}/health`);
});